var path = require('path');
var Promise = require('bluebird');
const ncp = Promise.promisify(require('ncp'));

Promise.all([
    ncp('src/schema', 'lib/schema'),
    ncp('src/domain/outcomes', 'lib/domain/outcomes'),
    ncp('src/config.json', 'lib/config.json'),
    ncp('package.json', 'lib/package.json')
]);
