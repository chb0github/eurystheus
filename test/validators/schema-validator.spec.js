import chai from 'chai';
import getValidator from '../../src/validators/schema-validator';
import emailSchema from '../../src/schema/email-task-schema.json';
import patchSchema from '../../src/schema/patch-task-schema.json';

import _ from 'lodash';

const payload = {
    field1: 'something',
    field2: ['somethingelse', 'foobazbar'],
    field3: {
        field3sub1: 10,
        field3sub2: '2015-09-30T01:29:20.614Z'
    },
    field4: [
        {
            field4sub1: 'foo'
        },
        {
            field4sub1: 'baz'
        }
    ]
};

const schema = {
    type: "object",
    properties: {
        field1: {
            type: 'string'
        },
        field2: {
            type: 'array',
            items: {
                type: 'string',
                enum: ['somethingelse', 'foobazbar']
            }
        },
        field3: {
            type: 'object',
            properties: {
                field3sub1: {
                    type: 'integer'
                },
                field3sub2: {
                    type: 'string',
                    format: 'date-time'
                }
            }
        },
        field4: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    field4sub1: {
                        type: 'string'
                    }
                }
            }
        }
    },
    "required": [
        "field1",
        "field2",
        "field3",
        "field4"
    ]
};


const should = chai.should();
const validator = getValidator();

describe('Validators', () => {
    it('should validate a simple object', () => {
        const isValid = validator.validate(payload, schema);
        const error = validator.getLastError();
        const errors = validator.getLastErrors();

        isValid.should.equal(true);
        should.not.exist(error);
        should.equal(errors, undefined);
    });

    it('should validate a simple object with multiple errors and fail it', () => {
        var test = _.cloneDeep(payload);
        test.field2 = ['bad'];
        test.badattribute = 'blah';
        const isValid = validator.validate(test, schema);
        const error = validator.getLastError();
        const errors = validator.getLastErrors();

        isValid.should.equal(false);
        should.exist(error);
        errors.length.should.equal(2);
        errors[0].code.should.equal('OBJECT_ADDITIONAL_PROPERTIES');
        errors[0].path.should.equal('#/');

        errors[1].code.should.equal('ENUM_MISMATCH');
        errors[1].path.should.equal('#/field2/0');

    });
});
