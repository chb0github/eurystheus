let ds = require('../../../src/ws/controllers/deserializer');
//let thesaurus = require('../../../src/domain/thesauri/yes-no-absolute-thesaurus');

let assert = require('assert');

class TestClass {
    constructor() {

    }

    foo() {
    }

    getBaz() {
        return "bazme"
    }

    getBat() {
        return "batme"
    }
}

describe('Unit test for DTO deserializer', function () {


    before(function () {

    });

    after(function () {
    });

    beforeEach(function (done) {
        done();
    });

    it('should dtoify a class object', done => {
        let result = ds.toDto(new TestClass());
        let expected = {
            baz: "bazme",
            bat: "batme"
        };
        assert.deepEqual(expected, result);
        done();
    });
    it('should dtoify a class a simple object with functions', done => {
        let result = ds.toDto({
            booHoo: () => "should not get",
            getFuManChu: () => "kungfu"
        });
        let expected = {
            fumanchu: "kungfu"
        };
        assert.deepEqual(result,expected);
        done();
    });

    it('should dtoify an array of objects', done => {
        let input = [{
                booHoo: () => "should not get",
                getFuManChu: () => "kungfu"
            },
            new TestClass()
        ];
        let result = ds.toDto(input);
        let expected = [
            {
                fumanchu: "kungfu"
            },
            {
                baz: "bazme",
                bat: "batme"
            }
        ];
        assert.deepEqual(result,expected);
        done();
    });

    it('should climb the prototype tree', done => {
        //console.log("currently not supported");
        //let result = ds.toDto(thesaurus);
        //let expected = [
        //    {
        //        fumanchu: "kungfu"
        //    },
        //    {
        //        baz: "bazme",
        //        bat: "batme"
        //    }
        //];
        //assert.deepEqual(result,expected);
        done();
    });

});
