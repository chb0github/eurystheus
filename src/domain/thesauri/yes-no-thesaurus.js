import thesaurus from './thesaurus';


var synonyms = {
    "yes" : "yes",
    "no" : "no",
    "nope" : "no",
    "never" : "no",
    "yeah" : "yes",
    "sure" : "yes"
};

var YesNoThesaurus = function () {
    this.id = thesaurus.next();
};
YesNoThesaurus.prototype.getLocale = function() {
    return "en_US";
};

YesNoThesaurus.prototype.getId = function() {
    return this.id;
};

YesNoThesaurus.prototype.getDescription = function() {
    return "Will take various forms of 'yes' and 'no' in US English";
};

YesNoThesaurus.prototype.getFriendlyName = function() {
    return "Colloquial Yes/No";
};

YesNoThesaurus.prototype.getDictionary = function () {
    return synonyms;
};


YesNoThesaurus.prototype.synonym = function(response) {
    // also can apply a regex or NLP
    return synonyms[response];
};

module.exports = YesNoThesaurus;
