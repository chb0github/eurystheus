'use strict'

var outcomeService = require('../services/outcome-service');
var deserializer = require('../controllers/deserializer');

module.exports = function (server) {
    server.get('/outcomes', function (req, res) {
        var outcomes = outcomeService.getAll();
        return res.send(outcomes || []);
    });


    server.post('/outcomes/', (req,res,next) => {
        let outcome = outcomeService.save(req.body);
        var location = `/outcomes/${outcome.id}`;
        res.header("Location", location);
        return res.send(201,outcome)
    });

    server.get('/outcomes/:id', function (req, res) {
        var outcome = outcomeService.get(req.params.id);

        // got to figure out how to move to an exception model
        if (!outcome) {
            return res.send(404, {code: 404, message: "outcome not found", entityId: req.params.id});
        }
        return res.send(outcome);
    });

};
