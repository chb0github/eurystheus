'use strict';
var Dao = require('../../daos/outcome-dao');

var OutcomeService = function () {
    this.dao = new Dao();
};

OutcomeService.prototype.save = function (outcome) {
    this.dao.save(out);
};

OutcomeService.prototype.get = function (id) {
    return this.dao.get(id);
};

OutcomeService.prototype.getAll = function () {
    return this.dao.getAll();
};

export default new OutcomeService();
