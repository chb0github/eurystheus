import Promise from 'bluebird';
import amqp from 'amqplib';
import { expirationQueue } from '../../config';
import quorumService from './quorum-service';
import outcomeService from './outcome-service';
import thesaurusService from './thesaurus-service';
import notifierService from './notifier/notifier-service';
import dao from '../../daos/task-dao';
import UnknownEntityError from '../../errors/unknown-entity-error.js'
import InvalidStateError from '../../errors/invalid-state-error.js'
import _ from 'lodash';


const QUEUE_NAME = 'ncp-tasks-system-expiration-queue';

class TaskService {
    constructor() {
        // use deferred so we can do this.channel.then
        // since creating the queue is asnychornous
        // we want to make sure the channel exists
        // before publishing to it
        var details = (expirationQueue.user && expirationQueue.pass) ? {credentials: amqp.credentials.plain(expirationQueue.user, expirationQueue.pass)} : {};
        let deferred = Promise.pending();
        this.channel = deferred.promise;
        amqp.connect(`amqp://${expirationQueue.host}`, details)
            .then((conn) => {
                return conn.createChannel();
            })
            .then(((ch) => {
                deferred.resolve(ch);
                return Promise.all([
                    ch.assertExchange(expirationQueue.exchange, 'x-delayed-message', {
                        durable: true,
                        arguments: {'x-delayed-type': 'direct'}
                    }),
                    ch.assertQueue(QUEUE_NAME, {exclusive: true}),
                    ch.bindQueue(QUEUE_NAME, expirationQueue.exchange, ''),
                    ch.consume(QUEUE_NAME, this.expireTask.bind(this), {noAck: true})
                ]);
            }).bind(this))
            .catch((error) => {
                console.log(`Error in queue, ${error}`);
            });
    }

    expireTask(msg) {
        const str = msg.content.toString();
        const taskSynopsis = JSON.parse(str);
        const task = dao.get(taskSynopsis.id);

        // until the system has persistence we need to gobble down any tasks that
        // come in as they may be from previous runs and still sitting on the queue
        if (task) {
            if (task.status === 'active') {
                task.status = 'expired';
                task.results.final = task.expiration.response;
                dao.save(task);
                console.log(`expiration of task:${task.id}`);
                notifierService.notifyTaskDone(task, (task, error) => {
                    if (error) {
                        console.log('Task: %d  failed to notify reason:%j', task.id, error);
                    }
                });
            }
        }
        else {
            console.log(`expiration of unknown task:${taskSynopsis.id}`);
        }
    }

    receiveResponse(msg) {
        var task = dao.get(msg.id);
        if (!task) {
            throw new UnknownEntityError('Task', id);
        }

        // if it isn't active, ignore it.
        if (task.status === 'active') {
            var outcomes = outcomeService.get(task.outcomes);// not needed this should be validated at task creation
            var thesaurus = thesaurusService.get(task.thesaurus) || thesaurusService.get('no-op-thesaurus');
            var synonym = thesaurus.synonym(msg.response);
            var toCheck = [].concat(msg.response).concat(synonym || []);

            // I don't like using findIndex
            var valid = outcomes.values.findIndex(x => toCheck.findIndex(y => x === y) >= 0) >= 0;

            var vote = {
                who: msg.from,
                what: msg.response,
                when: new Date(),
                synonym: synonym,
                message: msg.lines
            };
            if (valid) {
                task.results.votes.push(vote);
                var quorum = quorumService.get(task.quorum);
                let finalOutcome = quorum.shouldNotify(task.results.votes);
                if (finalOutcome) {
                    task.status = 'complete';
                    task.results.final = finalOutcome;
                    notifierService.notifyTaskDone(task, (task, error) => {
                        if (error) {
                            console.log(error);
                        }
                        console.log('Task %d %s', task.id, task.status);
                    });
                }
            }
            else {
                task.results.rejections.push(vote);
                // move this message into the tasker
                notifierService.notifyInvalidResponse(task, msg.from, (task, error) => {
                    if (error) {
                        console.log(error);
                    }
                    // if there was an error, should we mark the task as failed or escalate/delate to someone or try again?
                    // service should make a few attempts
                });
            }
        }
    }

    updateTask(user, id, body) {
        var task = dao.get(id);
        if (!task)
            throw new UnknownEntityError('Task', `task ${id} not found`);

        task.addAudit({
            "who": user,
            "update": body
        });

        // this is getting ugly -- need state machine.
        if (body) {
            if ((body.status && task.status !== 'active') || task.final)
                throw new InvalidStateError(`Task ${task.id} can no longer be updated`);

            if (body.description)
                task.description = body.description;

            if (body.notifiers)
                task.notifiers = body.notifiers;

            if (body.status) {
                task.status = body.status;
            }
            task = dao.update(task);
            if (task.status === 'overridden') {
                notifierService.notifyTaskDone(task, (error) => {
                    console.log(`error sending override notice for ${task.id}: ${JSON.stringify(error)}`);
                });
            }
        }
        else {
            // empty body means resubmit
            if (task.final) {
                notifierService.notifyTaskDone(task, (error) => {
                    console.log(`error resending notice for ${task.id}: ${JSON.stringify(error)}`);
                });
            }
        }
        return task;
    }

    get(id) {
        return dao.get(id);
    }

    query(from, to, status) {
        return dao.query(from, to, status);
    }

    save(task) {
        // validate payload
        task.status = 'active';
        task.results = {};
        task.results.final = null;
        task.results.votes = [];
        task.results.rejections = [];
        task.assignees = task.to.map(to => to.assignee);
        task.audit = [];
        task.addAudit = (details) => {
            var log = _.cloneDeep(details);
            log.timestamp = new Date();
            task.audit.push(log);
        };

        task = dao.save(task);
        this.shelve(task);
        notifierService.notifyTaskStart(task, (err) => {
            task.status = 'error';
            task.addAudit({
                message: 'failed to send task start notification',
                error: err
            });
        });
        return task;
    }

    // shelve must be called after save, since save
    // sets the created time
    shelve(task) {
        if (!task.id || !task.created) {
            throw new UnknownEntityError('Task', task.id, `Attempted to shelve a task that isn\'t in the system.`);
        }

        // delay could potentially turn out to be negative, make sure
        // to delay 0 or more ms
        const message = JSON.stringify({id: task.id});
        let delay = task.expiration.at.getTime() - task.created.getTime();
        // remove these logs when we are more confident
        console.log(`created: ${task.created}`);
        console.log(`expire: ${task.expiration.at}`);
        if (delay < 0)
            throw 'computed a negative expiration time for a task. This is an error!';

        console.log(`task ${task.id} will delay ${delay / 1000}s`);
        this.channel.then((ch) => {
            ch.publish(expirationQueue.exchange, '', new Buffer(message), {
                headers: {
                    'x-delay': delay
                }
            });
        });

    }
}

export default new TaskService();
