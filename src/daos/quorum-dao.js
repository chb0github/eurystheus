var find = require('require-all');
var p = require('path');
var _ = require('lodash');


var QuorumDao = function () {
    this.quorum = find({
        dirname: __dirname + '/../domain/quorum',
        filter: '.*-quorum\.js',
        resolve: function (Quorum) {
            return new Quorum();
        },
        map: function (name, path) {
            return p.basename(path, '.js');
        }
    });

    var result = {};

    _.each(this.quorum, function (value) {
        result[value.getId()] = value;
    });

    this.quorum = result;
};

QuorumDao.prototype.get = function (id) {
    return this.quorum[id];
};

QuorumDao.prototype.getAll = function () {
    return _(this.quorum).values();
};


module.exports = QuorumDao;


