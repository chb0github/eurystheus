var cfg = require('../../../../config.json').email;

module.exports.process = function(req) {
    // how to enable global logging like this?
    //console.log("received mandril message");
    // TODO throw here if no Mandrill event
    var decoded = decodeURIComponent(req.params.mandrill_events);
// a form url message with the value being an actual JSON payload. Retarded
    var dto = JSON.parse(decoded);
        // assumes type = 'inbound' -- we need to
    return dto.filter(_ => _.event === "inbound").map(_ => {
        var replyTo = _.msg.to[0][0];
        var matches = replyTo.match(`${cfg.prefix}-([0-9]+).*`);
        var taskId  = matches ? parseInt(matches[1]) : replyTo;

        var responseLines = _.msg.text.split(/\r?\n/).filter(s => s.length > 0);
        return {
            id: taskId,
            response: responseLines[0],
            lines: responseLines,
            from: _.msg.from_email
        }
    });


};
