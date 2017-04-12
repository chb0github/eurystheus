var sinon = require('sinon');
var rewire = require('rewire');
let controller = rewire('../../../src/ws/controllers/quorum-controller');
let deserializer = require('../../../src/ws/controllers/deserializer');

import * as assert from "assert";

describe('Test quorum controller', () =>{

    let quorum = [
        {
            getId : () => "first-response",
            getFriendlyName : () => "friendly-first"
        },
        {
            getId : () => "second-response",
            getFriendlyName : () => "friendly-second"
        }
    ];
    let expected = deserializer.toDto(quorum);

    let server = {
        get: sinon.spy(),
        post: sinon.spy()

    };
    let res = {
        send: sinon.spy(),
    };
    var mocks = {
        'quorumService': {
            getAll: sinon.stub(),
            get: sinon.stub()
        }
    };
    before(() => {
            controller.__set__(mocks);
            controller(server);
            assert.equal(2,server.get.callCount);
        }
    );

    afterEach(() => {
        mocks.quorumService.getAll.reset();
        mocks.quorumService.get.reset();
        res.send.reset();
    });


    it('should get all quorum on /quorum', done => {

        mocks.quorumService.getAll.returns(quorum);

        assert.ok(server.get.calledWith("/quorum"));
        let cb = server.get.args[0][1];
        let retval = cb({},res,() =>{});

        assert.ok(mocks.quorumService.getAll.calledOnce);
        assert.equal(1,res.send.callCount);

        assert.deepEqual(res.send.args[0][0],expected);

        done();
    });


    it('should get a single quora on /quorum/:id', done => {


        mocks.quorumService.get.withArgs(1).returns(quorum[0]);

        assert.ok(server.get.calledWith("/quorum/:id"));
        let cb = server.get.args[1][1];
        let retval = cb({
            params: {
                id: 1
            }

        },res,() =>{});

        assert.ok(mocks.quorumService.get.calledWith(1));
        assert.equal(res.send.callCount,1);
        assert.deepEqual(res.send.args[0][0],expected[0]);

        done();
    });

    it('should return a 404 on /quorum/:id for an invalid id', done => {
        mocks.quorumService.get.returns(null);

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
