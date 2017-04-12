import thesaurus from './thesaurus';

var synonyms = {
    "yes": "yes",
    "no": "no"
};

var YesNoAbsoluteThesaurus = function () {
    this.id = thesaurus.next();
};
YesNoAbsoluteThesaurus.prototype.getLocale = function() {
    return "en_US";
};

YesNoAbsoluteThesaurus.prototype.getId = function() {
    return this.id;
};

YesNoAbsoluteThesaurus.prototype.getDescription = function() {
    return "Only yes/no are allowed in US English";
};

YesNoAbsoluteThesaurus.prototype.getFriendlyName = function() {
    return "Yes or No only";
};

YesNoAbsoluteThesaurus.prototype.getDictionary = function () {
    return synonyms;
};

YesNoAbsoluteThesaurus.prototype.synonym = function (response) {
    // also can apply a regex or NLP
    return synonyms[response];
};

module.exports = YesNoAbsoluteThesaurus;
