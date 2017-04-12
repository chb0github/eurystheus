var id = 0;

//
//var Thesaurus = function(locale,friendlyName,description)  {
//    this.locale = locale;
//    this.friendlyName = friendlyName;
//    this.description = description;
//    this.id = id++;
//};
//
//Thesaurus.prototype.getLocale = function() {
//    return this.locale;
//};
//
//Thesaurus.prototype.getId = function() {
//    return this.id;
//};
//
//Thesaurus.prototype.getDescription = function() {
//    return this.description;
//};
//
//Thesaurus.prototype.getFriendlyName = function() {
//    return this.friendlyName;
//};
function next() {
    return id++;
}

module.exports.next = next;

