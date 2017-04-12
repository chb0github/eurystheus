import restify from 'restify';
import path from 'path';

class WebHookNotifier {
    constructor() {
        this.id = path.basename(__filename, ".js").split("-")[0];
    }

    getDescription() {
        return "Will send the results of the task as a webhook (A.K.A POSTBack)";
    }

    getFriendlyName() {
        return "Webhook";
    }

    notify(options, message, cb) {
        var parts = options.endpoint.split("/");
        if (parts) {
            var client = restify.createJsonClient({
                url: parts[0] + "//" + parts[2]
            });

            client[options.method.toLowerCase()]("/" + parts[3], message, (err) => {
                if (err) {
                    console.log(`${err.statusCode}: ${options.endpoint}`);
                    console.log(JSON.stringify(options));
                    cb && cb(err);
                }
            });
        }

    }

    getId() {
        return this.id;
    }

}


export default new WebHookNotifier();
