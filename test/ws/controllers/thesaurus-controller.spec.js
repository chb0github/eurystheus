var sinon = require('sinon');
var rewire = require('rewire');
let controller = rewire('../../../src/ws/controllers/thesaurus-controller');
let deserializer = require('../../../src/ws/controllers/deserializer');

import * as assert from "assert";

describe('Test the thesaurus controller', function () {

    let server = {
        get: sinon.spy()
    };
    let res = {
        send: sinon.spy()
    };
    var mocks = {
        'thesaurusService': {
            getAll: sinon.stub(),
            get: sinon.stub()
        }
    };
    let thesauri = [
        {
            getDescription : () => "thesarus1",
            getFriendlyName : () => "friendly thesaurus1",
            getLocale : () => "locale1",
            getId : () => 1
        },
        {
            getDescription : () => "thesarus2",
            getFriendlyName : () => "friendly thesaurus2",
            getLocale : () => "locale2",
            getId : () => 2
        }
    ];
    let expected = deserializer.toDto(thesauri);

    before(() => {
            controller.__set__(mocks);
            controller(server);
            assert.equal(2,server.get.callCount);
        }
    );

    afterEach(() => {
        mocks.thesaurusService.getAll.reset();
        mocks.thesaurusService.get.reset();
        res.send.reset();
    });

    it('should get all thesauri on /thesauri', function (done) {
        mocks.thesaurusService.getAll.returns(thesauri);

        assert.ok(server.get.calledWith("/thesauri"));
        let cb = server.get.args[0][1];
        let retval = cb({},res,() =>{});

        assert.ok(mocks.thesaurusService.getAll.calledOnce);
        assert.equal(1,res.send.callCount);

        assert.deepEqual(res.send.args[0][0],expected);

        done();
    });

    it('should get a single thesaurus on /thesauri/:id', done => {


        mocks.thesaurusService.get.withArgs(1).returns(thesauri[0]);

        assert.ok(server.get.calledWith("/thesauri/:id"));
        let cb = server.get.args[1][1];
        let retval = cb({
            params: {
                id: 1
            }

        },res,() =>{});

        assert.ok(mocks.thesaurusService.get.calledWith(1));
        assert.equal(res.send.callCount,1);
        assert.deepEqual(res.send.args[0][0],expected[0]);

        done();
    });

    it('should return a 404 on /thesauri/:id for an invalid id', done => {
        mocks.thesaurusService.get.returns(null);

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
