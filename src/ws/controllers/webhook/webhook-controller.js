const taskService = require('../../services/task-service').default;
let find = require('require-all');
let p = require('path');
var providers = find({
    dirname: `${__dirname}/providers`,
    filter: '.*-provider\.js',
    map : function(name,path) {
        return p.basename(path,'.js').split("-")[0];
    }
});

module.exports = function (server) {

    server.post('/webhook/email/:provider', function (req, res) {

        var processor = providers[req.params.provider];
        if (!processor)
            return res.send(404, {message: "Provider not found", 'provider': req.params.provider});

        // we are going to have to handle rejection/bounce emails, etc at some point
        try {
            var messages = processor.process(req);
        }
        catch (e) {
            return res.send(400, {message: "something wrong with the payload", error: e.message});
        }

        messages.forEach(m => {
            if(taskService.get(m.id))
                taskService.receiveResponse(m);
            else
                console.log("Message for unknown task '%d' received ",m.id);
        });
        res.send();
    });

};

