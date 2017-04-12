var sinon = require('sinon');
var rewire = require('rewire');
let controller = rewire('../../../src/ws/controllers/outcome-controller');

import * as assert from "assert";

describe('Test outcomes controller', () =>{

    let outcomes = [
        {
            id : 1,
            values: ['yes','no']
        },
        {
            id : 2,
            values: ['foo','baz']
        }
    ];

    let server = {
        get: sinon.spy(),
        post: sinon.spy()

    };
    let res = {
        send: sinon.spy(),
        header: sinon.spy()
    };
    var mocks = {
        'outcomeService': {
            getAll: sinon.stub(),
            get: sinon.stub(),
            save: sinon.stub()
        }
    };
    before(() => {
            controller.__set__(mocks);
            controller(server);
            assert.equal(2,server.get.callCount);
        }
    );

    afterEach(() => {
        mocks.outcomeService.getAll.reset();
        mocks.outcomeService.get.reset();
        res.send.reset();
    });


    it('should get all outcomes on /outcomes', done => {

        mocks.outcomeService.getAll.returns(outcomes);

        assert.ok(server.get.calledWith("/outcomes"));
        let cb = server.get.args[0][1];
        let retval = cb({},res,() =>{});

        assert.ok(mocks.outcomeService.getAll.calledOnce);
        assert.equal(1,res.send.callCount);
        assert.equal(res.send.args[0][0],outcomes);

        done();
    });

    it('should create a new outcome set on /outcomes/ and return a resource location', done => {

        let cb = server.post.args[0][1];
        let outcome = {
            id: 10,
            values: ['blah', 'boo']
        };
        mocks.outcomeService.save.withArgs(outcome.values).returns(outcome);
        var request = {
            body: outcome.values

        };
        let retval = cb(request,res,() =>{});

        assert.ok(res.header.calledWith("Location",`/outcomes/${outcome.id}`));
        assert.ok(res.send.calledWith(201, outcome));

        done();
    });

    it('should get a single notifier on /outcomes/:id', done => {


        mocks.outcomeService.get.withArgs(1).returns(outcomes[0]);

        assert.ok(server.get.calledWith("/outcomes/:id"));
        let cb = server.get.args[1][1];
        let retval = cb({
            params: {
                id: 1
            }

        },res,() =>{});

        assert.ok(mocks.outcomeService.get.calledWith(1));
        assert.equal(res.send.callCount,1);
        assert.deepEqual(res.send.args[0][0],outcomes[0]);

        done();
    });

    it('should return a 404 on /outcomes/:id for an invalid id', done => {
        mocks.outcomeService.get.returns(null);

        let cb = server.get.args[1][1];
        let retval = cb({
            params: {
                id: 9999
            }

        },res,() =>{});

        assert.ok(res.send.calledWith(404));

        done();
    });

});
