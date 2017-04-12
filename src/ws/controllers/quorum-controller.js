var deserializer = require('./deserializer');

var quorumService = require('../services/quorum-service');

module.exports = function (server) {
    server.get('/quorum', function (req, res, next) {
        var quorum = quorumService.getAll();
        var results = quorum.map(qui => deserializer.toDto(qui));

        return res.send(results);
    });

    server.get('/quorum/:id', function (req, res, next) {
        var qui = quorumService.get(req.params.id);
        if(!qui)
            return res.send(404, {message: "quorum not found", id: req.params.id});

        return res.send(deserializer.toDto(qui));
    });
};
