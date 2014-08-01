define(function (require) {
    'use strict';

    var CardGame = require('cardgame/Main');

    var Uno = require('uno/Uno');

    var main = new CardGame('#game-container', new Uno());

    main.run();
});