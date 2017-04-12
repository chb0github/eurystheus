

describe('Start the service and test that it loads all controllers',  () => {

    before(function () {
        let server = require('../src/eurystheus');
        let client = restify.createJsonClient({
            url: 'http://127.0.0.1:7070'
        });


    });

    after(function () {
        GLOBAL.test.server.close();
    });


});
