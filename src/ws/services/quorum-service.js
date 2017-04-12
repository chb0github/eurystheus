var Dao = require('../../daos/quorum-dao');

var QuiService = function () {
    this.dao = new Dao();

};

QuiService.prototype.get = function (id) {
    if (!id)
        throw Error("null id not allowed");

    return this.dao.get(id);
};

QuiService.prototype.getAll = function () {
    return this.dao.getAll();
};

export default new QuiService();
