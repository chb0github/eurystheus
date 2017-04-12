// move this to a parent controller class at some point

var make = (object) => {
    var result = {};
    let props = Object.getOwnPropertyNames(object.__proto__).concat(Object.keys(object));
    props.map(k => k.match("get(.*)")).filter(g => g).filter(g => typeof(object[g[0]]) === 'function').forEach( g => {
        var prop = g[1].toLowerCase();
        var value = object[g[0]]();
        result[prop] = value;
    });
    return result;
};

var getProps = (object) => {
    var props = [];
    if(object) {
        props.concat(Object.getOwnPropertyNames(object)).concat(Object.keys(object));
        props.concat(getProps(object.__proto__));
        props.concat(getProps(object.prototype));
    }
    return props;
};

var toDto = (object) => {
    var result;
    var me = this;
    if (Array.isArray(object)) {
        result = object.map(o => toDto(o))
    }
    else {
        result = make(object);
    }

    return result;
};


module.exports.toDto = toDto;
