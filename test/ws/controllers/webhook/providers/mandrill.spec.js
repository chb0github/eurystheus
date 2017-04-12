import * as assert from "assert";
var cfg = require('../../../../../src/config.json').email;

// this sort of thing is completely retarded.
let processor = require('../../../../../src/ws/controllers/webhook/providers/mandrill-provider');
describe('Tests for mandrill webhook processor', function () {
    var req;
    let event = encodeURIComponent(JSON.stringify([
            {
                event: 'inbound',
                msg: {
                    to: [
                        [
                            `${cfg.prefix}-1234@something`
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
                        `${cfg.prefix}-567@something`
                    ]
                    ],
                    text: "yes\r\nLine1\r\nLine2",
                    from_email: "joe@schmo.com"
                }
            }
        ]
    ));
    var res;
    before(() => {

    });


    beforeEach(function (done) {
        req = {
            params: {
                mandrill_events: event
            }
        };
        done();
    });

    it('should test the nominal case for mandrill webhook processing', done => {
        var expected = [{
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
        var results = processor.process(req);
        assert.deepEqual(results, expected);
        done();
    });


});
