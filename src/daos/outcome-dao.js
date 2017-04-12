var find = require('require-all');
var p = require('path');
var _ = require('lodash');
var Chance = require('chance');
var random = new Chance();

var OutcomeDao = function () {
    var found = find({
        dirname: __dirname + '/../domain/outcomes',
        filter: '.*\.js',
        map: function (name, path) {
            return p.basename(path, '.js');
        }
    });

    this.outcomes = {};
    Object.keys(found).forEach(k => {
        var outcome = found[k];
        this.outcomes[outcome.id] = outcome;
    });

};

OutcomeDao.prototype.save = function (outcomes) {
    const oOutcomes = {
        id: random.natural(),
        outcomes: outcomes
    };

    this.outcomes[oOutcomes.id] = oOutcomes;
    return oOutcomes;
};

OutcomeDao.prototype.get = function (id) {
    return this.outcomes[id];
};

OutcomeDao.prototype.getAll = function () {
    return _(this.outcomes).values();
};

module.exports = OutcomeDao;
