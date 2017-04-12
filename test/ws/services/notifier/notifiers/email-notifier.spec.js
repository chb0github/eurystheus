import assert from 'assert';
import sinon  from 'sinon';
import proxyquire from 'proxyquire';


var cfg = require('../../../../../src/config.json').email;
describe('Tests for the email notifier', () => {
    var notifier;
    var email;
    var server;
    var consoleStub;
    var frm = `${cfg.prefix}@${cfg.domain}`;
    var task = {
        id: 123,
        assignees: ['christian.bongiorno@nintex.com','foo@baz.bat']
    };
    var replyto = `${cfg.prefix}-${task.id}@${cfg.domain}`;

    beforeEach(() => {
            consoleStub = sinon.stub(console, 'log');
            server = {
                send: sinon.stub()
            };
            email = {
                server : {
                    connect: () => server
                }
            };
            notifier = proxyquire('../../../../../src/ws/services/notifier/notifiers/email-notifier', {
                'emailjs': email

            }).default;
        }
    );
    afterEach(() => {
        consoleStub.restore();
    });
    it('#notify should send an email to all assignees of a task with subject/message', done => {

        notifier.notify(task,null,'some subject','message');
        assert.equal(server.send.callCount,2);
        assert.deepEqual(server.send.args[0][0],{
            text: 'message',
            from: frm,
            "reply-to": replyto,
            to: 'christian.bongiorno@nintex.com',
            subject: 'some subject'
        });
        assert.deepEqual(server.send.args[1][0],{
            text: 'message',
            from: frm,
            "reply-to": replyto,
            to: 'foo@baz.bat',
            subject: 'some subject'
        });

        done();
    });
    it('#notify should send an email to a specific set of recipients with subject/message', done => {


        notifier.notify(task,['foo@bar','baz@bat'],'some subject','message');
        assert.equal(server.send.callCount,2);
        assert.deepEqual(server.send.args[0][0],{
            text: 'message',
            from: frm,
            "reply-to": replyto,
            to: 'foo@bar',
            subject: 'some subject'
        });
        assert.deepEqual(server.send.args[1][0],{
            text: 'message',
            from: frm,
            "reply-to": replyto,
            to: 'baz@bat',
            subject: 'some subject'
        });

        done();
    });

    it('#notify log errors in the event of a sending problem', done => {
        var task = {
            id: 123,
            assignees: ['christian.bongiorno@nintex.com']
        };
        var replyto = `${cfg.prefix}-${task.id}@${cfg.domain}`;

        server.send.onFirstCall().callsArgWith(1,{
            error:'some error'
        },'foo-error');
        var called = false;
        var cb = (task,err) =>{
            called = task && err;
        };
        notifier.notify(task,null,'some subject','message',cb);
        assert.equal(console.log.callCount,1);
        assert.ok(called);
        //
        //// just verify some details get logged
        assert.ok(console.log.getCall(0).args[0].match('.*some error.*'));
        assert.ok(console.log.getCall(0).args[0].match('.*foo-error.*'));
        assert.ok(console.log.getCall(0).args[0].match('.*message.*'));
        done();
    });
});
