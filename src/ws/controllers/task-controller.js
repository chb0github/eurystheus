import restify from 'restify';
import _ from 'lodash';
import getSchemaValidator from '../../validators/schema-validator';
import newEmailTask from '../../schema/email-task-schema.json';
import patchSchema from '../../schema/patch-task-schema.json';
const taskService = require('../services/task-service').default;

const eot = new Date((Math.pow(2, 31) - 1) * 1000);
const bot = new Date(0);

// Ideally we would move this to somewhere so that
// we can generisize validation and make it innate
// validation must be done BEFORE any type marshalling or we need to figureout how to compare date types!

var schemaValidate = (schema) => {
    return (req, res, next) => {

        const SchemaValidator = getSchemaValidator();
        let payload = req.body;

        // if the payload is valid, call next w/o errors
        if (SchemaValidator.validate(payload, newEmailTask)) {
            return next();
        }
        // remove these logs when commiting to master
        console.log(`schema: ${JSON.stringify(schema,null,4)}`);
        console.log(`payload: ${JSON.stringify(payload,null,4)}`);
        // if the payload is not valid, call next w/ errors
        var lastErrors = SchemaValidator.getLastErrors();
        console.log(`errors: ${JSON.stringify(lastErrors, null, 4)}`);
        next(new restify.InvalidArgumentError(`Invalid payload, ${JSON.stringify(lastErrors, null, 4)}`));
    };
};
var semanticValidate = (req, res, next) => {
    let task = req.body;
    const now = new Date();
    let delay = task.expiration.at.getTime() - now.getTime();
    var failures = {};
    if (delay <= 0) {
        failures['/#/expiration/at'] = 'Task expiration is in the past';
        return next(new restify.InvalidContentError(JSON.stringify(failures, null, 4)));
    }
    return next();
};

module.exports = function (server) {
    server.get('/tasks/?.*', function (req, res, next) {
        var to = eot;
        var from = bot;
        var status = ".*";
        if (req && req.params) {
            if (req.params.from)
                from = new Date(req.params.from);

            if (req.params.to)
                to = new Date(req.params.to);

            if (req.params.status)
                status = req.params.status;
        }
        var result = taskService.query(from, to, status);
        return res.send(result || []);
    });

    var revive = (req, res, next) => {
        var task = req.body;
        task.expiration.at = new Date(task.expiration.at);
        task.reminders = task.reminders.map(r => new Date(r));
        task.to.forEach(t => {
            t.escalation.forEach(e => {
                e.after = new Date(e.after);
            })
        });
        return next();
    };

    server.post('/tasks/?', schemaValidate(newEmailTask), revive, semanticValidate, (req, res) => {
        var task = taskService.save(req.body);
        res.header("Location", "/tasks/" + task.id);
        return res.send(201, task);
    });

    server.patch('/tasks/:id', schemaValidate(patchSchema), (req, res) => {
        const update = req.body;
        var taskId = req.params.id;
        var task = taskService.get(taskId);
        if (!task) {
            return res.send(404, {code: 404, message: "Task not found", entityId: taskId})
        }
        const user = req.headers['user'] || 'not supplied'; // should throw an exception
        task = taskService.updateTask(user, task.id, update);
        return res.send(task);
    });

    server.get('/tasks/:id', function (req, res) {
        var result = taskService.get(req.params.id);
        if (!result) {
            return res.send(404, {code: 404, message: "Task not found", entityId: req.params.id})
        }
        return res.send(result);
    });
};

