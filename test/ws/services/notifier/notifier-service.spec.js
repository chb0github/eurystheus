import * as assert from 'assert';
import sinon  from 'sinon';
import rewire from 'rewire';

var notifierService = rewire('../../../../src/ws/services/notifier/notifier-service');


describe.skip('Unit test for Notification service', () => {

    var outcomeService = {
        get: sinon.stub()
    };

    var outcome = {id: 1, values: ['yes', 'no']};
    var find = sinon.stub();
    var webhook = sinon.stub();
    var email = sinon.stub();


    outcomeService.get.withArgs(1).returns(outcome);
    find.onCall(0).returns({
        webhook: webhook,
        email: email
    });


    before(() => {
        notifierService.__set__({
            outcomeService: outcomeService,
            find: find
        });
    });



    it('should get all existing notification methods', done => {
        let notifiers = notifierService.getAll();
        assert.equal(notifiers[0].getId(),"email-notifier");
        assert.equal(notifiers[1].getId(),"webhook");

        done();
    });


    it.skip('#notifyTaskStart should notify the assignees of task assignment via the method configured in the task', done => {
        let task = {
            method: "email",
            outcomes: 1,
            subject: "some subject",
            assignees: ['christian.bongiorno@nintex.com']
        };

        notifierService.notifyTaskStart(task);
        throw new Error();

        done();
    });


    it.skip('#notifyInvalidResponse it should notify the person who sent the response that their task response was invalid', done => {
        throw new Error();
        done();
    });

    it.skip('#notifyTaskComplete it should notify all registered completion receivers that the task is done', done => {
        throw new Error();
        done();
    });

    it.skip('#getNotifier should return a single notification method based on id', done => {
        throw new Error();
        done();
    });

    it.skip('#getAllNotifiers should return all notification methods', done => {
        throw new Error();
        done();
    });

    it.skip('should place a task synopsis on an exiration queue (this test not previously implemented)', done => {
        done();
    });

    it.skip('should expire a task and publish the results to all notifiers (this test not previously implemented)', done => {
        done();
    });

});
