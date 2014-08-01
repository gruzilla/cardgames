define('cardgame/Game', ['text!cardgame/templates/pile/pile.html'], function(pilePartial) {
    'use strict';

    // the constructor
    var Game = function(cards, piles) {
        this.cards = cards;
        this.piles = piles;
        this.partials = {
            pile: pilePartial
        };

        this.name = '';
        this.backUrl = '';
    };

    Game.prototype.cardUrl = function() {
        return '';
    };

    Game.prototype.run = function() {

    };

    Game.prototype.getPartial = function(id) {
        if (this.partials.hasOwnProperty(id)) {
            return this.partials[id];
        }

        return '';
    };

    Game.prototype.unfold = function(event, id) {
        console.debug(id);
    };

    return Game;
});