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
    return "Produces a locale specific lower-casing of a given response. Good for normalizing input to match expected outcomes";
};

NoOpThesaurus.prototype.getFriendlyName = function() {
    return "Lowercase";
};

NoOpThesaurus.prototype.synonym = function(response) {
    // also can apply a regex or NLP
    return response.toLocaleLowerCase();
};

module.exports = NoOpThesaurus;
