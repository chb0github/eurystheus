var path = require('path');

var FirstResponseQuorum = function() {
    var match = path.basename(__filename, ".js").match("(.*)-quorum");
    this.id = match[1];
};

FirstResponseQuorum.prototype.getDescription = function() {
  return "Task is complete on first legit response";
};

FirstResponseQuorum.prototype.getFriendlyName = function() {
  return "First Response";
};

FirstResponseQuorum.prototype.shouldNotify = function(votes) {
    return votes[0] && votes[0].what;
};

FirstResponseQuorum.prototype.getId = function() {
    return this.id;
};

module.exports = FirstResponseQuorum;
