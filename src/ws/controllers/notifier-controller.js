var deserializer = require('./deserializer');

var notifierService = require('../services/notifier/notifier-service');


module.exports = function (server) {
    server.get('/notifiers', function (req, res) {
        var notifiers = notifierService.getAll();
        var results = notifiers.map(notifier => deserializer.toDto(notifier));
        return res.send(results);
    });

    server.get('/notifiers/:id', function (req, res) {
        var validator = notifierService.get(req.params.id);
        if (!validator)
            return res.send(404, {message: "notifier not found", id: req.params.id});

        return res.send(deserializer.toDto(validator));
    });
};
