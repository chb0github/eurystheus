import _ from 'lodash';
import assert from 'assert';
import sinon  from 'sinon';
import proxyquire from 'proxyquire';

describe('TaskService', () => {
    let taskService;
    let task;
    let quorumService;
    let outcomeService;
    let thesaurusService;
    let notifierService;
    let dao;
    let amqp;
    let chStub;

    const goodOutcomes = { id: 1, values: [ 'yes', 'no' ]} ;

    const taskTemplate = {
        id: 123,
        method: 'email',
        outcomes: 1,
        quorum: 'first-responder-quorum',
        thesaurus: 1,
        to: [{
            assignee: 'christian.bongiorno@nintex.com'
        }],
        notifiers: [
            {
                type: 'webhook'
            }
        ],
        results: {
            votes: [],
            rejections: []
        },
        status: 'active',
        expiration: {
            at: new Date('2015-11-05T12:29:00Z'),
            response: 'yes'
        }
    };

    beforeEach(() => {
        quorumService = {
            get: sinon.stub()
        };
        outcomeService = {
            get: sinon.stub()
        };
        thesaurusService = {
            get: sinon.stub()
        };
        notifierService = {
            notifyTaskDone: sinon.stub(),
            notifyTaskStart: sinon.stub(),
            notifyInvalidResponse: sinon.stub()
        };
        dao = {
            get: sinon.stub(),
            save: sinon.stub(),
            query: sinon.stub()
        };
        chStub = sinon.stub();
        chStub.returns({
            catch: () => {}
        });
        amqp = {
            connect: () => {
                return {
                    then: () => {
                        return {
                            then: chStub
                        };
                    }
                };
            }
        };

        task = _.cloneDeep(taskTemplate);
        dao.get.withArgs(task.id).returns(task);

        taskService = proxyquire('../../../src/ws/services/task-service', {
            'amqplib': amqp,
            './quorum-service': {
                default: quorumService
            },
            './outcome-service': {
                default: outcomeService
            },
            './thesaurus-service': {
                default: thesaurusService
            },
            './notifier/notifier-service': {
                default: notifierService
            },
            '../../daos/task-dao': {
                default: dao
            }
        }).default;
    });

    describe('#expireTask()', () => {
        it('should expire a task', () => {
            let msg = {
                content: '{ "id": 123 }'
            };

            taskService.expireTask(msg);

            assert.equal(task.status, 'expired');
            assert.equal(task.results.final, task.expiration.response);
        });

        it('should ignore invalid task ids.', () => {
            let msg = {
                content: '{ "id": 654 }'
            };

            var stub = sinon.stub(console, 'log');
            taskService.expireTask(msg);
            var result = console.log.getCall(0).args[0];
            var callCount = console.log.callCount;
            stub.restore();

            assert.equal(callCount,1);
            // just make sure somewhere in the log output the id is captured
            assert.ok(result.match('.*654.*'));
        });

        it('should not expire inactive tasks', () => {
            let msg = {
                content: '{ "id": 123 }'
            };

            task.status = 'complete';

            taskService.expireTask(msg);

            assert.equal(task.status, 'complete');
        });
    });

    describe('#receiveResponse()', () => {
        it('should successfully receive a response and pass a vote and notify task complete', () => {
            let msg = {
                id: task.id,
                response: 'yes',
                lines: ['yes', 'next line in the email'],
                from: 'christian.bongiorno@nintex.com'
            };

            outcomeService.get.withArgs(1).returns(goodOutcomes);
            thesaurusService.get.withArgs(1).returns({
                synonym: (resp) => resp
            });
            var quora = sinon.stub();
            quora.onCall(0).returns('yes');
            quorumService.get.withArgs(task.quorum).returns({
                shouldNotify: quora
            });


            taskService.receiveResponse(msg);

            assert.equal(task.results.votes[0].who, 'christian.bongiorno@nintex.com');
            assert.equal(task.results.votes[0].what, 'yes');
            assert.equal(task.results.votes[0].synonym, 'yes');
            assert.equal(task.results.votes[0].message, msg.lines);
            assert.equal(task.status, 'complete');
            assert.equal(task.results.final, 'yes');

            assert.equal(1, notifierService.notifyTaskDone.callCount);
            assert.ok(notifierService.notifyTaskDone.calledWith(task));
        });

        it('should notify the originator of an invalid response', () => {
            let msg = {
                id: task.id,
                response: 'badbad',
                lines: ['yes', 'next line in the email'],
                from: 'christian.bongiorno@nintex.com'
            };

            outcomeService.get.withArgs(1).returns(goodOutcomes);
            thesaurusService.get.withArgs(1).returns({
                synonym: (resp) => resp
            });
            var quora = sinon.stub();
            quora.onCall(0).returns(null);
            quorumService.get.withArgs(task.quorum).returns({
                shouldNotify: quora
            });

            taskService.receiveResponse(msg);

            assert.equal(task.results.rejections[0].who, 'christian.bongiorno@nintex.com');
            assert.equal(task.results.rejections[0].what, 'badbad');
            assert.equal(task.results.rejections[0].synonym, 'badbad');
            assert.equal(task.results.rejections[0].message, msg.lines);
            assert.equal(task.status, 'active');
            assert.ok(!task.results.final);

            assert.equal(1, notifierService.notifyInvalidResponse.callCount);
            assert.ok(notifierService.notifyInvalidResponse.calledWith(task, msg.from));
        });

        it('hould ignore inactive tasks', () => {
            let msg = {
                id: task.id
            };
            task.status = 'complete';
            var snapshot = _.cloneDeep(task);
            taskService.receiveResponse(msg);
            assert.deepEqual(task, snapshot); // the task object should not have been touched!
            assert.equal(0, notifierService.notifyTaskDone.callCount);
            assert.equal(0, notifierService.notifyInvalidResponse.callCount);
        });

        it('should throw and error if its an unknown task id', () => {
            let msg = {
                id: 9999
            };

            assert.throws(() => {
                taskService.receiveResponse(msg);
            });
        });
    });

    describe('#get()', () => {
        it('should return a task if it exists', () => {
            const snapshot = _.cloneDeep(task);
            const foundTask = taskService.get(123);
            assert.deepEqual(foundTask, snapshot);

            const notFound = taskService.get(654);
            assert.equal(notFound, null);
        });
    });

    describe('#query', () => {
        it('should query the dao for a task based on status, to and from', () => {
            const eot = new Date((Math.pow(2, 31) - 1) * 1000);
            const bot = new Date(0);
            taskService.query(bot, eot, '.*');
            assert.ok(dao.query.calledWith(bot, eot, '.*'));
        });

        it('should query the dao for a single task based on id', () => {
            var result = taskService.get(task.id);
            assert.ok(dao.get.calledWith(task.id));
            assert.deepEqual(result, task);
        });
    });

    describe('#save()', () => {
        beforeEach(() => {
            taskService.shelve = sinon.stub();
        });

        it('should save a new task correctly and notify the assignees', () => {
            task.status = null;
            task.to.push({
                assignee: 'foo@baz'
            });
            dao.save.withArgs(task).returns(task);
            taskService.save(task);

            assert.equal(1, taskService.shelve.callCount);

            assert.equal(task.status, 'active');
            assert.ok(task.results);
            assert.ok(!task.results.final);
            assert.ok(task.results.votes);
            assert.equal(0, task.results.votes.length);
            assert.equal(0, task.results.rejections.length);
            assert.deepEqual(['christian.bongiorno@nintex.com', 'foo@baz'], task.assignees);

            assert.equal(1, notifierService.notifyTaskStart.callCount);
            assert.deepEqual(task, notifierService.notifyTaskStart.firstCall.args[0]);
        });
        it('should audit an error in notification', () => {
            throw new Error('implement me');
        });
    });

    describe('#shelve()', () => {
        it('should shelve a task if it exists', () => {
            task.created = new Date('2015-11-04T12:29:00Z');

            taskService.shelve(task);

            assert.equal(chStub.callCount, 1);
        });

        it('should not try to shelve a task that hasn\'t been inserted into the system', () => {
            assert.throws(() => {
                taskService.shelve(task);
            });
        });

        it('should throw an error if a negative delay time is computed', () => {
            task.created = new Date('2030-11-04T12:29:00Z');
            assert.throws(() => {
                taskService.shelve(task);
            });
        });
    });

    describe('#updateTask()', () => {
        it('should throw an UnknownEntityError if a bad id is entered', () => {
            throw new Error('implement me');
        });

        it('should audit every call', () => {
            throw new Error('implement me');
        });

        it('should only allow status update if the task status is not active', () => {
            throw new Error('implement me');
        });

        it('should only allow status update if the task status is not active', () => {
            throw new Error('implement me');
        });
        it('should resend task done notification on empty body if task has been finalized', () => {
            throw new Error('implement me');
        });

        it('should allow description, status and notifiers to be overwritten', () => {
            throw new Error('implement me');
        });

        it('should send out task done notifications if status is overridden', () => {
            throw new Error('implement me');
        });

    });
});
