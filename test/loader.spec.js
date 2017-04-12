import load from '../src/loader'
import * as assert from 'assert'

describe('Test finder', () =>{


    it('should find all js files in a directory with a suffix', done => {
        let result = load(`${__dirname}/../src/daos`,'-dao');
        assert.deepEqual(Object.keys(result),['outcome','quorum','task','thesaurus']);
        done();
    });

    it('should find nothing if given the wrong suffix', done => {
        let result = load(`${__dirname}/../src/daos`,'-foo');
        assert.deepEqual(Object.keys(result),[]);
        done();
    });

    it('should find everything given no suffix', done => {
        let result = load(`${__dirname}/../src/daos`);
        assert.deepEqual(Object.keys(result),["outcome-dao", "quorum-dao", "task-dao", "thesaurus-dao"]);
        done();
    });

});
