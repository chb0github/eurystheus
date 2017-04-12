var find = require('require-all');
var p = require('path');

import outcomeService from '../outcome-service';

var log = (err) => {
    if (err)
        console.log(err);
};

class NotifierService {
    constructor() {
        this.methods = find({
            dirname: __dirname + '/notifiers',
            filter: '.*-notifier\.js',
            resolve: function (method) {
                return method.default;
            },
            map: function (name, path) {
                return p.basename(path, '.js').split("-")[0];
            }
        });
        this.getOutcomes = (task) => {
            let outcomes = outcomeService.get(task.outcomes);
            if (!outcomes)
                throw new Error(`No outcomes defined for Task ${task.id}`);
            return outcomes && outcomes.values;
        }
    }

    getNotifier(id) {
        return this.methods[id];
    }

    getAll() {
        return Object.keys(this.methods).map(k => this.methods[k]);
    }

    notifyTaskStart(task, cb) {
        var call = cb || log;

        let notifier = this.methods[task.method];
        let outcomes = this.getOutcomes(task);
        let lines = [
            task.message,
            `You may reply with \'${outcomes.slice(0, -1).join("\', ")}\' or \'${outcomes[outcomes.length - 1]}\'`
        ];
        let message = lines.join("\r\n");
        notifier.notify(task, null, task.subject, message, call);
    }

    notifyInvalidResponse(task, to, cb) {
        var call = cb || log;
        var notifier = this.methods[task.method];
        let outcomes = this.getOutcomes(task);
        var reject = task.results.rejections;
        let lines = [
            `Your response of \'${reject[reject.length - 1].what}\' was invalid`,
            `You may reply with \'${outcomes.slice(0, -1).join("\', ")}\' or \'${outcomes[outcomes.length - 1]}\'`
        ];
        let message = lines.join("\r\n");
        let subj = "Invalid Task response";
        notifier.notify(task, to, subj, message, call);
    }

    notifyTaskDone(task,cb) {
        var call = cb || log;
        task.notifiers.forEach(options => {
            var result = {
                taskId: task.id,
                status: task.status,
                "routing-key": options["routing-key"],
                results: task.results
            };
            var notifier = this.methods[options.type];
            // this is only working for webhook!
            notifier.notify(options, result,call);
        });
    }
}

export default new NotifierService();
