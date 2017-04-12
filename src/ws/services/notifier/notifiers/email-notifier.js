var email = require("emailjs");
var cfg = require('../../../../config.json').email;
var server = email.server.connect(cfg);
// var backoff = require('backoff');
let path = require('path');

class EmailNotifier {
    constructor() {
        //https://github.com/MathieuTurcotte/node-backoff
        // retry TBD
        this.id = path.basename(__filename, ".js");
        this.from = `${cfg.prefix}@${cfg.domain}`
    }

    notify(task, to, subject, message, cb) {
        var replyto = `${cfg.prefix}-${task.id}@${cfg.domain}`;

        let recipients = (to && [].concat(to)) || task.assignees;
        recipients.forEach(TO => {
            var details = {
                text: message,
                from: this.from,
                "reply-to": replyto,
                to: TO,
                subject: subject
            };
            server.send(details, (err, message) => {
                if(err) {
                    console.log(`${message}: ${JSON.stringify(err)} ${JSON.stringify(details)}`);
                }
                cb && cb(err, task);
            });
        })
    }


    getDescription() {
        return "Sends tasking information via email";
    }

    getFriendlyName() {
        return "Email";
    }

    getId() {
        return this.id;
    }
}
export default new EmailNotifier();
