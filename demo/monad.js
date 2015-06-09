/*
    http://flippinawesome.org/2013/10/28/a-gentle-introduction-to-monads-in-javascript/

    Example use:

    var person = {
        "name": "Homer Simpson",
        "address": {
            "street": "123 Fake St.",
            "city": "Springfield"
        }
    };

    Before:

    if (person != null && person["address"] != null) {
        var state = person["address"]["state"];
        if (state != null) {
            console.log(state);
        }
        else {
            console.log("State unknown");
        }

    After:

    var state = Maybe(person)
        .then(Maybe(person["address"])
        .then(Maybe(person["address"]["state"])))
        .maybe("State unknown", function (s) {
            return s;
        });
    console.log(state);

    OR

    var state = Maybe(person["address"]["state"])
        .maybe("State unknown", function (s) {
            return s;
        });
    console.log(state);

*/

var Maybe = function (value) {

    var Nothing = {
        bind: function () {
            return this;
        },
        isNothing: function () {
            return true;
        },
        val: function () {
            throw new Error('Cannot call val() nothing');
        },
        then: function () {
            return this;
        },
        maybe: function (def) {
            return def;
        }
    };

    var Something = function (value) {
        return {
            bind: function (fn) {
                return new Maybe(fn.call(this, value));
            },
            isNothing: function () {
                return false;
            },
            val: function () {
                return value;
            },
            then: function (maybe) {
                return maybe;
            },
            maybe: function (def, fn) {
                return fn.call(this, value);
            }
        };
    };

    if (value === null || typeof value === 'undefined') {
        return Nothing;
    }

    return new Something(value);
};
