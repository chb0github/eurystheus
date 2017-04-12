/**
 * Schema validator
 *
 * Exposes the ZSchema validator (https://github.com/zaggino/z-schema)
 * Usage:
 * import validator from '/schema/validator';
 *
 * // returns true/false for valid/invalid
 * let isValid = validator.validate(jsonToValidate, schemaToValidateWith);
 *
 * // last error from the last validation run
 * let error = validator.getLastError();
 *
 * // all errors from the last validation run
 * let errors = validator.getLastErrors();
 *
 */
import ZSchema from 'z-schema';

export default function getValidator() {
    /**
     * JSON Schema Validator
     * https://github.com/zaggino/z-schema#options
     * @type {ZSchema}
     */
    return new ZSchema({
        noEmptyArrays: true, // do not allow empty arrays unless explicitly allowed with "minItems: 0"
        noEmptyStrings: true, // do not allow empty string unless explicitly allowed with "minLength: 0"
        noTypeless: true, // all schemas must specify a "type"
        noExtraKeywords: true, // do not allow extra stuff (no defined in schema),
        breakOnFirstError: false,
        assumeAdditional: true // assume that additionalItems and additionalProperties are set to false
    });
}
