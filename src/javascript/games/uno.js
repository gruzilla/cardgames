/* exported Uno */
function Uno() {
    'use strict';

    var piles = [
        {
            id: 'deck',
            name: 'Stapel',
            unfoldAble: false,
            cards: [
                'yellow0', 'yellow1', 'yellow2', 'yellow3', 'yellow4', 'yellow6', 'yellow7', 'yellow8', 'yellow9', 'yellowStop', 'yellowReverse', 'yellowPlus2',
                'red0', 'red1', 'red2', 'red3', 'red4', 'red6', 'red7', 'red8', 'red9', 'redStop', 'redReverse', 'redPlus2',
                'green0', 'green1', 'green2', 'green3', 'green4', 'green6', 'green7', 'green8', 'green9', 'greenStop', 'greenReverse', 'greenPlus2',
                'blue0', 'blue1', 'blue2', 'blue3', 'blue4', 'blue6', 'blue7', 'blue8', 'blue9', 'blueStop', 'blueReverse', 'bluePlus2',
                'wild', 'wild4'
            ].shuffle(),
            top: '40%',
            left: '31%'
        },
        {
            id: 'center',
            name: 'Spielfeld',
            cards: [],
            top: '40%',
            left: '48%',
            incoming: function(fromPile, cardName) {
                // return true for accepting the incoming card
                // and false for disallowing it

                if (this.cards.length === 0) {
                    return true;
                }

                var lastCard = this.cards[this.cards.length-1];

                var pattern = /(red|yellow|blue|green|wild)(.*)/;
                var match = pattern.exec(lastCard);
                if (!match || 3 !== match.length) {
                    return false;
                }
                var colorExisting = match[1];
                var detailExisting = match[2];


                match = pattern.exec(cardName);
                if (!match || 3 !== match.length) {
                    return false;
                }
                var colorIncoming = match[1];
                var detailIncoming = match[2];

                return ('wild' === colorIncoming ||
                    'wild' === colorExisting ||
                    colorExisting === colorIncoming ||
                    detailExisting === detailIncoming);
            }
        },
        {
            id: 'player1',
            name: 'Spieler 1',
            unfoldAnimation: 'rotate',
            cards: [],
            top: '8%',
            left: '40%',
            rotate: '180deg',
            sort: true,
            incoming: function(fromPile) { // , cardName
                return 'deck' === fromPile;
            }
        },
        {
            id: 'player2',
            name: 'Spieler 2',
            unfoldAnimation: 'rotate',
            cards: [],
            top: '75%',
            left: '40%',
            sort: true,
            incoming: function(fromPile) { // , cardName
                return 'deck' === fromPile;
            }
        }
    ];

    var moves = [
        ['deck', 'player1'],
        ['deck', 'player1'],
        ['deck', 'player1'],
        ['deck', 'player1'],
        ['deck', 'player1'],
        ['deck', 'player1'],
        ['deck', 'player1'],

        ['deck', 'player2'],
        ['deck', 'player2'],
        ['deck', 'player2'],
        ['deck', 'player2'],
        ['deck', 'player2'],
        ['deck', 'player2'],
        ['deck', 'player2']
    ];

    return {
        name: 'uno',
        piles: piles,
        moves: moves
    };
}

