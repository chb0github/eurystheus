var sinon = require('sinon');
var rewire = require('rewire');
let controller = rewire('../../../src/ws/controllers/task-controller');

import * as assert from "assert";
const eot = new Date((Math.pow(2, 31) - 1) * 1000);
const bot = new Date(0);

import chai from 'chai';
import getValidator from '../../../src/validators/schema-validator';
import emailSchema from '../../../src/schema/email-task-schema.json';
import patchSchema from '../../../src/schema/patch-task-schema.json';

import _ from 'lodash';

const should = chai.should();
const validator = getValidator();

var emailPayload = {
    method: "email",
    description: "Task for requesting time off",
    outcomes: 1,
    quorum: "first-responder",
    thesaurus: 1,
    expiration: {
        at: "2018-09-30T01:29:20.614Z",
        response: "yes"
    },
    notifiers: [
        {
            type: "webhook",
            endpoint: "http://requestb.in/1kou40a1",
            method: "POST",
            "routing-key": "user-defined-routing-key",
            "content-type": "application/json"
        }
    ],
    reminders: ["2015-09-30T01:29:20.614Z", "2015-09-30T01:29:20.614Z", "2015-09-30T01:29:20.614Z"],
    message: "Renai Bell is requesting 3 days off from 9/10/2015 to 9/13/2015",
    to: [
        {
            assignee: "christian.bongiorno@nintex.com",
            escalation: [
                {
                    after: "2018-09-30T01:29:20.614Z",
                    method: "email",
                    to: "christian.bongiorno@nintex.com"
                },
                {
                    after: "2018-09-30T01:29:20.614Z",
                    method: "email",
                    to: "christian.bongiorno@nintex.com"
                }
            ]
        },
        {
            assignee: "christian.bongiorno@gmail.com",
            escalation: [
                {
                    after: "2018-09-30T01:29:20.614Z",
                    method: "email",
                    to: "christian.bongiorno@nintex.com"
                },
                {
                    after: "2018-09-30T01:29:20.614Z",
                    method: "email",
                    to: "christian.bongiorno@nintex.com"
                }
            ]
        }
    ],
    from: "TimeOff@nintex.com",
    subject: "Time off request for Renai Bell"
};


var tasks = [
    emailPayload,
    _.cloneDeep(emailPayload)
];


describe('Test the task controller', function () {
    var server;
    var res;
    var mocks;
    beforeEach(() => {
            server = {
                get: sinon.spy(),
                post: sinon.spy(),
                patch: sinon.spy()

            };
            res = {
                send: sinon.spy(),
                header: sinon.spy()
            };
            mocks = {
                'taskService': {
                    get: sinon.stub(),
                    save: sinon.stub(),
                    query: sinon.stub(),
                    updateTask: sinon.stub()
                }
            };
            controller.__set__(mocks);
            controller(server);
            assert.equal(2, server.get.callCount);
            assert.equal(1, server.post.callCount);
        }
    );

    describe('resources on the task controller', () => {

        it('should get all tasks on /tasks', done => {

            var tempTasks = _.cloneDeep(tasks);

            tempTasks[0].status = 'active';
            tempTasks[0].created = new Date();
            tempTasks[0].id = 1;

            tempTasks[1].status = 'active';
            tempTasks[1].created = new Date();
            tempTasks[1].id = 2;
            mocks.taskService.query.withArgs(bot, eot, ".*").returns(tempTasks);

            assert.ok(server.get.calledWith("/tasks/?.*"));
            let cb = server.get.args[0][1];

        cb({}, res, () => {});

            assert.ok(mocks.taskService.query.calledOnce);
            assert.equal(1, res.send.callCount);
            assert.ok(res.send.calledWith(tempTasks));

            done();
        });

        it('should get a task by id on /tasks/:id', done => {

            mocks.taskService.get.withArgs(1).returns(tasks[0]);

            assert.ok(server.get.calledWith("/tasks/:id"));
            let cb = server.get.args[1][1];
            var req = {
                params: {
                    id: 1
                }
            };
        cb(req, res, () => {});

            assert.ok(mocks.taskService.get.calledOnce);
            assert.equal(1, res.send.callCount);
            assert.ok(res.send.calledWith(tasks[0]));

            done();
        });

        it('should give a 404 when searching for a non-existent task on /tasks', function (done) {
            mocks.taskService.get.withArgs(1).returns(tasks[0]);

            let cb = server.get.args[1][1];
            var req = {
                params: {
                    id: 9999
                }
            };
        cb(req, res, () => {});

            assert.ok(mocks.taskService.get.calledOnce);
            assert.equal(1, res.send.callCount);
            assert.ok(res.send.calledWith(404));

            done();
        });

        it('should make use of query params on /tasks ', done => {
            var from = new Date("2014-09-30T01:29:20.614Z");
            var to = new Date("2016-09-30T01:29:20.614Z");
            mocks.taskService.query.withArgs(from, to, "expired").returns(tasks);

            assert.ok(server.get.calledWith("/tasks/?.*"));
            let cb = server.get.args[0][1];
            var req = {
                params: {
                    status: 'expired',
                    from: '2014-09-30T01:29:20.614Z',
                    to: '2016-09-30T01:29:20.614Z'
                }
            };

        cb(req, res, () => {});

            assert.ok(mocks.taskService.query.calledOnce);
            assert.equal(1, res.send.callCount);
            assert.ok(res.send.calledWith(tasks));

            done();
        });

        it('should create a task on /tasks', function (done) {
            assert.ok(server.post.calledWith("/tasks/?"));
            var task = _.cloneDeep(tasks[0]);
            mocks.taskService.save.withArgs(task).returns(task);

            let cb = server.get.args[0][1];
            var req = {
                body: task
            };
            // if we add the validator back in this line will need to change

            let schemaValidate = server.post.args[0][1];
            var check;
            schemaValidate(req, res, (v) => check = v);
            assert.ok(!check);

            let revive = server.post.args[0][2];
        revive(req,res,() => {});
            task.id = 10;

            let post = server.post.args[0][4];
        post(req,res,() => {});
            assert.equal(mocks.taskService.save.callCount, 1);
            assert.equal(res.send.callCount, 1);
            assert.ok(res.header.calledWith("Location", "/tasks/10"));
            assert.ok(res.send.calledWith(201, task));
            done();
        });

        it('should patch a task on /tasks with select fields', (done) => {
            assert.deepEqual(server.patch.args[0][0],"/tasks/:id");
            var task = _.cloneDeep(tasks[0]);

            var req = {
                headers: {
                    'user': 'foo'
                },
                params: {
                    id: 10
                },
                body:{
                    "description": "foo",
                    "status": "overridden",
                    "notifiers": [
                        {
                            "type": "webhook",
                            "endpoint": "http://requestb.in/qjrxp8qj",
                            "method": "POST",
                            "routing-key": "no expire",
                            "content-type": "application/json"
                        }
                    ]
                }
            };
            task.id = req.params.id;

            mocks.taskService.get.withArgs(task.id).returns(task);
            mocks.taskService.updateTask.withArgs('foo',req.params.id,req.body).returns(task);

            let schemaValidate = server.patch.args[0][1];
            schemaValidate(req, res, (error) => {
                assert.deepEqual(error,undefined);
            });


            let patch = server.patch.args[0][2];
            patch(req, res, () => {});
            assert.equal(mocks.taskService.get.callCount, 1);
            assert.deepEqual(mocks.taskService.updateTask.args[0],['foo',req.params.id,req.body]);
            assert.equal(res.send.callCount, 1);
            assert.deepEqual(res.send.args[0][0],task);
            done();
        });
    });
    describe('Validators', () => {
        describe('New task validator', () => {
            it('should validate our example email task payload', () => {
                var test = _.cloneDeep(emailPayload);
                const isValid = validator.validate(test, emailSchema);
                const error = validator.getLastError();
                const errors = validator.getLastErrors();

                isValid.should.equal(true);
                should.not.exist(error);
                should.equal(errors, undefined);
            });

            it('should reject an invalid task payload', () => {
                var test = _.cloneDeep(emailPayload);
                test.method = 'bad';
                test.badattribute = 'blah';
                const isValid = validator.validate(test, emailSchema);
                const error = validator.getLastError();
                const errors = validator.getLastErrors();

                isValid.should.equal(false);
                should.exist(error);
                errors.length.should.equal(2);
                errors[0].code.should.equal('OBJECT_ADDITIONAL_PROPERTIES');
                errors[0].path.should.equal('#/');

                errors[1].code.should.equal('ENUM_MISMATCH');
                errors[1].path.should.equal('#/method');

            });
        });

        describe('Patch task validator', () => {

            var patchPayload = {
                "description": "foo",
                "status": "overridden",
                "notifiers": [
                    {
                        "type": "webhook",
                        "endpoint": "http://requestb.in/qjrxp8qj",
                        "method": "POST",
                        "routing-key": "no expire",
                        "content-type": "application/json"
                    },
                    {
                        "type": "webhook",
                        "endpoint": "http://requestb.in/qjrxp8qj",
                        "method": "POST",
                        "routing-key": "foo",
                        "content-type": "application/json"
                    }
                ]
            };

            it('should validate and allow a valid patch', () => {
                const isValid = validator.validate(patchPayload, patchSchema);
                const error = validator.getLastError();
                const errors = validator.getLastErrors();

                isValid.should.equal(true);
                should.not.exist(error);
                should.equal(errors, undefined);
            });

            it('should allow an empty body for patching', () => {
                var payload = {};
                const isValid = validator.validate(payload, patchSchema);
                const error = validator.getLastError();
                const errors = validator.getLastErrors();

                isValid.should.equal(true);
                should.not.exist(error);
                should.equal(errors, undefined);
            });

            it('should validate a patch payload and catch multiple errors', () => {
                var test = _.cloneDeep(patchPayload);
                test.method = 'noedit';
                test.status = 'badstat';
                const isValid = validator.validate(test, patchSchema);
                const error = validator.getLastError();
                const errors = validator.getLastErrors();

                isValid.should.equal(false);
                should.exist(error);

                console.log(JSON.stringify(errors, null, 4));
                errors[0].code.should.equal('OBJECT_ADDITIONAL_PROPERTIES');
                errors[0].path.should.equal('#/');

                errors[1].code.should.equal('ENUM_MISMATCH');
                errors[1].path.should.equal('#/status');
                errors.length.should.equal(2);

            });
        });
    });
});
