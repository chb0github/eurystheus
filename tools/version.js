'use strict'

var vdata = require('../package.json');
import * as fs from 'fs';

var match = vdata.version.match('([0-9]+)\.([0-9]+)\.([0-9]+)');
if(!match)
    throw `Expecting version string of x.y.z but got ${vdata.version}`;

var minor = parseInt(match[3]);
minor++;
console.log(minor);

vdata.version = `${match[1]}.${match[2]}.${minor}`;

var path = process.cwd() + '/package.json';
console.log(path);
fs.writeFileSync(path,JSON.stringify(vdata,null,2), {
    flag: 'w'
});


