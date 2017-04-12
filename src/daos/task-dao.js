var Chance = require('chance');
var random = new Chance();
import UnknownEntityError from '../../src/errors/unknown-entity-error.js'

// only for testing!! Remove before prod
//var test = require('../../test/data/email-task.json');
var TaskDao = function () {
    this.tasks ={};
};


TaskDao.prototype.save = function (task) {
    task.created = new Date();
    task.id = random.natural();
    task.toString = () => task.id.toString();
    this.tasks[task.id] = task;
    return task;
};

TaskDao.prototype.update = function(task) {
    if(!this.tasks[task.id])
        throw new UnknownEntityError('Task', `Task ${id} not found`);

    this.tasks[task.id] = task;
    return task;
};

TaskDao.prototype.get = function (taskId) {
    return this.tasks[taskId];
};

TaskDao.prototype.query = function (from, to, status) {
    var results = [];
    var me = this;
    Object.keys(this.tasks).forEach(function (key) {
        var task = me.tasks[key];
        var cMs = task.created.getTime();
        var between = cMs >= from.getTime() && cMs < to.getTime();

        if (between && task.status.match(status))
            results.push(task);
    });

    return results;
};

export default new TaskDao();
