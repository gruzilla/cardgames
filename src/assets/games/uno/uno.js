/* exported Uno */
/* global cgEngine */
function Uno() {
    'use strict';

    // load assets
    var cards = cgEngine.utils.loadDeck('uno');
    var piles = cgEngine.utils.loadPiles('uno');

    // game specific initializations
    piles.deck.cards = cards.shuffle();

    // automatic moves before game starts
    var moves = [
        new cgEngine.Move(piles.deck, piles.player1, { drawStrategy: 'firstXCards', drawXCards: 7 }),
        new cgEngine.Move(piles.deck, piles.player2, { drawStrategy: 'firstXCards', drawXCards: 7 }),
    ];

    // declare game
    return {
        name: 'uno',
        piles: piles,
        moves: moves,

        // global function hooks
        // moveAllowed: function(move) {}
        cardUrl: function(card) { // , pile // additional non needed parameter
            return 'assets/games/uno/cards.svg#' + card.url;
        },
        backUrl: 'assets/games/uno/cards.svg#back'
    };
}
