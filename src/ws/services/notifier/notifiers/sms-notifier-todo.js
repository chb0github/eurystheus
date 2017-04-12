// Your accountSid and authToken from twilio.com/user/account
var accountSid = 'AC32a3c49700934481addd5ce1659f04d2';
var authToken = "{{ auth_token }}";
var client;
//var client = require('twilio')(accountSid, authToken);
//https://github.com/twilio/twilio-node
class SmsTasker {
    constructor() {

    }
    notify(task, to) {
        client.messages.create({
            body: "Jenny please?! I love you <3",
            to: to,
            from: "+8675309"
        }, function(err, message) {
            process.stdout.write(message.sid);
        });
    }

    getDescription() {
        return "Sends tasking information via SMS (A.K.A Text Message)";
    }

    getFriendlyName() {
        return "SMS";
    }
}
export default new SmsTasker();

