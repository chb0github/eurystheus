var sinon = require('sinon');
var rewire = require('rewire');
let controller = rewire('../../../src/ws/controllers/notifier-controller');

import * as assert from "assert";

describe('task service server', function () {
    let server = {
        get: sinon.spy()
    };
    let res = {
        send: sinon.spy()
    };
    var mocks = {
        'notifierService': {
            getAll: sinon.stub(),
            get: sinon.stub()
        }
    };
    let notifiers = [
        {
            getDescription : () => "description1",
            getFriendlyName : () => "friendly1",
            getId : () => 1
        },
        {
            getDescription : () => "description2",
            getFriendlyName : () => "friendly2",
            getId : () => 2
        }
    ];
    before(() => {
            controller.__set__(mocks);
            controller(server);
            assert.equal(2,server.get.callCount);
        }
    );

    afterEach(() => {
        mocks.notifierService.getAll.reset();
        mocks.notifierService.get.reset();
        res.send.reset();
    });

    it('should get all notifiers on /notifiers', done => {

        mocks.notifierService.getAll.returns(notifiers);

        assert.ok(server.get.calledWith("/notifiers"));
        let cb = server.get.args[0][1];
        let retval = cb({},res,() =>{});

        assert.ok(mocks.notifierService.getAll.calledOnce);
        assert.equal(1,res.send.callCount);
        assert.ok(res.send.calledWith([{
                description: "description1",
                friendlyname: "friendly1",
                id : 1
            },
            {
                description: "description2",
                friendlyname: "friendly2",
                id : 2
            }
        ]));

        done();
    });


    it('should get a single notifier on /notifiers/:id', done => {


        mocks.notifierService.get.withArgs(1).returns(notifiers[0]);

        assert.ok(server.get.calledWith("/notifiers/:id"));
        let cb = server.get.args[1][1];
        let retval = cb({
            params: {
                id: 1
            }

        },res,() =>{});

        assert.ok(mocks.notifierService.get.calledWith(1));
        assert.equal(res.send.callCount,1);
        assert.deepEqual(res.send.args[0][0],{
            description: "description1",
            friendlyname: "friendly1",
            id : 1
        });

        done();
    });

    it('should return a 404 on /notifiers/:id for an invalid id', done => {
        mocks.notifierService.get.returns(null);

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
