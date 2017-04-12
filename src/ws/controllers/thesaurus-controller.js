
import {toDto as dto} from './deserializer';

var thesaurusService = require('../services/thesaurus-service');

module.exports = function (server) {
    server.get('/thesauri', function (req, res) {
        var thesauri = thesaurusService.getAll();
        var results = dto(thesauri);

        res.send(results);
    });

    server.get('/thesauri/:id', function (req, res) {
        var thesaurus = thesaurusService.get(req.params.id);
        if(!thesaurus)
            return res.send(404, {message: "thesaurus not found", id: req.params.id});

        return res.send(dto(thesaurus));
    });
};
