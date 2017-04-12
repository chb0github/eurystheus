'use strict';

module.exports =  function UnknownEntityError(entityName, id, message)  {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = `${entityName}:${id}not found - ${messae}`;
    this.entity = entityName;
};
require('util').inherits(module.exports, Error);
