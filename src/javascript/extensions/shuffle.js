'use strict';

if (!Array.prototype.shuffle) {
    Array.prototype.shuffle = function (o) { //v1.0
        if ('undefined' === typeof o) {
            o = this;
        }
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x) {}
        return o;
    };
}
