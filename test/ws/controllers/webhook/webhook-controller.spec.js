var sinon = require('sinon');
var rewire = require('rewire');
let controller = rewire('../../../../src/ws/controllers/webhook/webhook-controller');

import * as assert from "assert";

describe('Unit tests for webhook controller', function () {
    let event = encodeURIComponent(JSON.stringify([
            {
                event: 'inbound',
                msg: {
                    to: [
                        [
                            "task-1234@something"
                        ]
                    ],
                    text: "yes\r\n\r\nLine2",
                    from_email: "Christian.Bongiorno@Nintex.com"
                }

            },
            {
                event: 'inbound',
                msg: {
                    to: [[
                        "task-567@something"
                    ]
                    ],
                    text: "yes\r\nLine1\r\nLine2",
                    from_email: "joe@schmo.com"
                }
            }
        ]
    ));
    let server = {
        post: sinon.spy()
    };
    var req = {
        params: {
            provider: "mandrill"
        },
        getContentType: () => "application/x-www-form-urlencoded"
    };
    let res = {
        send: sinon.spy()
    };
    let taskService = {
        receiveResponse: sinon.spy(),
        get: sinon.stub()
    };
    let stub = sinon.spy();

    let provider = {
        process: sinon.stub()
    };



    before(() => {
            controller.__set__({
                'taskService': taskService,
                'providers': {
                    foo: provider
                }
            })
        }
    );


    beforeEach(() => {
        server.post.reset();
        res.send.reset();
        provider.process.reset();
        taskService.receiveResponse.reset();
    });

    it('should test a nonimal webhook case with only 2 emails in the hook. ', done => {
        controller(server);
        assert.ok(server.post.calledOnce);
        assert.ok(server.post.calledWithMatch("/webhook/email/:provider"));
        req.params.provider = "foo";
        let cb = server.post.args[0][1];


        var procPayload = [{
            id: 1234,
            response: "yes",
            lines: [
                "yes",
                "Line2"
            ],
            from: "Christian.Bongiorno@Nintex.com"
        },
        {
            id: 567,
            response: "yes",
            lines: [
                "yes",
                "Line1",
                "Line2"
            ],
            from: "joe@schmo.com"
        }];
        provider.process.withArgs(req).returns(procPayload);
        taskService.get.withArgs((procPayload[0].id)).returns(procPayload[0]);
        taskService.get.withArgs((procPayload[1].id)).returns(procPayload[1]);

        let result = cb(req, res);

        assert.ok(res.send.calledOnce);
        assert.ok(res.send.calledWith());
        assert.ok(taskService.receiveResponse.calledWith(procPayload[0]));
        assert.ok(taskService.receiveResponse.calledWith(procPayload[1]));
        done();
    });
    it('should reject an unsupported provider with a 404 ', done => {
        controller(server);
        assert.ok(server.post.calledOnce);
        assert.ok(server.post.calledWithMatch("/webhook/email/:provider"));

        let cb = server.post.args[0][1];
        req.params.provider = "baz";
        let result = cb(req, res);
        assert.ok(res.send.calledOnce);
        assert.ok(res.send.calledWithMatch(404));

        done();
    });

});
