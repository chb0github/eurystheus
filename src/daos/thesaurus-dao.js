var find = require('require-all');
var p = require('path');
var _ = require('lodash');


var ThesaurusDao = function () {
    var resultsRaw = find({
        dirname: __dirname + '/../domain/thesauri',
        filter: '.*-thesaurus\.js',
        resolve: function (Thesaurus) {
            return new Thesaurus();
        },
        map: function (name, path) {
            return p.basename(path, '.js');
        }
    });


    this.thesauri = {};
    var me = this;
    Object.keys(resultsRaw).forEach(k => {
        var thesaurus = resultsRaw[k];
        var id = thesaurus.getId();
        me.thesauri[id] = thesaurus;
    });

};

ThesaurusDao.prototype.get = function (id) {
    return this.thesauri[id];
};

ThesaurusDao.prototype.getAll = function () {
    var me = this;
    return Object.keys(this.thesauri).map(k =>me.thesauri[k]);
};

ThesaurusDao.prototype.query = function () {
    throw new Error("unsupported");
};

module.exports = ThesaurusDao;


