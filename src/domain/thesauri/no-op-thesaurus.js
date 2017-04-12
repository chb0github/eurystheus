import thesaurus from './thesaurus';

var NoOpThesaurus = function() {
    this.id = thesaurus.next();
};

NoOpThesaurus.prototype.getLocale = function() {
    return "en_US";
};

NoOpThesaurus.prototype.getId = function() {
    return this.id;
};

NoOpThesaurus.prototype.getDescription = function() {
    return "Does nothing. A word is only synonymous with itself";
};

NoOpThesaurus.prototype.getFriendlyName = function() {
    return "No Operation";
};

NoOpThesaurus.prototype.synonym = function(response) {
    // also can apply a regex or NLP
    return response;
};

module.exports = NoOpThesaurus;
