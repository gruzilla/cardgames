define('uno/Uno', ['cardgame/Game', 'cardgame/Move', 'json!uno/cards.json', 'json!uno/piles.json'], function(Game, Move, cards, piles) {
    'use strict';

    var Uno = function() {
        Game.call(
            this,
            JSON.parse(JSON.stringify(cards)), // clones!
            JSON.parse(JSON.stringify(piles))
        );

        this.name = 'Uno';
        this.backUrl = 'uno/cards.svg#back';

        // load all cards into the deck
        this.piles.deck.cards = this.cards.shuffle();

        // move some of them to the players hands
        this.moves = [
            new Move(this.piles.deck, this.piles.player1, { drawStrategy: 'firstXCards', drawXCards: 7 }),
            new Move(this.piles.deck, this.piles.player2, { drawStrategy: 'firstXCards', drawXCards: 7 }),
        ];

    };

    Uno.prototype = Object.create(Game.prototype);
    Uno.prototype.constructor = Uno;

    Uno.prototype.cardUrl = function(card) { // , pile // additional non needed parameter
        return 'uno/cards.svg#' + card.url;
    };

    return Uno;
});
