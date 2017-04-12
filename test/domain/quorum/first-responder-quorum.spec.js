import * as assert from 'assert'

import Quora from '../../../src/domain/quorum/first-responder-quorum'

describe('Tests for the first responder quora', () => {

    it('#shouldNotify should return the first valid vote', done => {
        let quora = new Quora();
        var votes = [{
            what: 'yes'
        }];
        assert.ok(quora.shouldNotify(votes));
        done();
    });

    it('#shouldNotify should return falsey if there are no votes', done => {
        let quora = new Quora();
        var votes = [];
        assert.ok(!quora.shouldNotify(votes));
        done();
    });
});
