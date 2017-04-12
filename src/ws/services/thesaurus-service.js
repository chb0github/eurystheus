var Dao = require('../../daos/thesaurus-dao');

var ThesaurusService = function () {
    this.dao = new Dao();
};

ThesaurusService.prototype.get = function (id) {
    if(!id)
        throw Error("null id not allowed");

    return this.dao.get(id);
};

ThesaurusService.prototype.getAll = function () {
    return this.dao.getAll();
};

ThesaurusService.prototype.query = function (from, to, locale) {
    return this.dao.query(from,to,locale);
};

export default new ThesaurusService();
