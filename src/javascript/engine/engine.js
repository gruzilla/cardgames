/* jshint evil:true */
var cgEngine;
(function($) {
    'use strict';

    /** Utils **/
    var _loadDeck = function(gameName) {
        var result = null;
        $.ajax({
            type: 'GET',
            url: 'assets/games/' + gameName + '/cards.json',
            dataType: 'json',
            success: function(data) {
                result = data;
            },
            data: {},
            async: false
        });
        return result;
    };

    var _loadPiles = function(gameName) {
        var piles = {};
        var result = null;
        $.ajax({
            type: 'GET',
            url: 'assets/games/' + gameName + '/piles.json',
            dataType: 'json',
            success: function(data) {
                result = data;
            },
            data: {},
            async: false
        });
        for (var i = 0; i < result.length; i++) {
            piles[result[i].id] = new Pile(result[i]);
        }

        return piles;
    };


    var Utils = function() {
        return {
            loadDeck: _loadDeck,
            loadPiles: _loadPiles
        };
    };


    /** Rules **/
    var _checkMove = function(move) {

        if (!move.target || !move.source) {
            return false;
        }

        if (move.state < 2) {
            move.draw();
            if (move.state < 2) {
                return false;
            }
        }

        if (move.source.outgoing) {
            for (var o = 0; o < move.source.outgoing.length; o++) {
                try {
                    if (!eval(move.source.outgoing[o])) {
                        return false;
                    }
                } catch (e) {
                    console.error('error evaluating outgoing rule on ' + move.source.outgoing.id + ' : ' + e);
                    return false;
                }
            }
        }

        if (move.target.incoming) {
            for (var i = 0; i < move.target.incoming.length; i++) {
                try {
                    var res = eval(move.target.incoming[i]);
                    if (!res) {
                        return false;
                    }
                } catch (e) {
                    console.error('error evaluating incoming rule to ' + move.source.id + ' : ' + e);
                    return false;
                }
            }
        }

        return true;
    };
    var Rules = function() {
        return {
            checkMove: _checkMove
        };
    };


    /** Pile **/
    var _drawStrategies = {
        'top': function(cards) { // , options
            if (0 === cards.length) {
                return [];
            }
            return [
                cards[cards.length-1]
            ];
        },
        'byId': function(cards, options) {
            var drawn = [];
            if (options.hasOwnProperty('drawCardId')) {
                for (var i = 0; i < cards.length; i++) {
                    if (options.drawCardId === cards[i].id) {
                        drawn.push(cards[i]);
                        break;
                    }
                }
            }
            return drawn;
        },
        'firstXCards': function(cards, options) {
            var drawn = [];
            if (options.hasOwnProperty('drawXCards')) {
                for (var i = cards.length - 1; i > Math.max(cards.length - options.drawXCards - 1, 0); i--) {
                    drawn.push(cards[i]);
                }
            }
            return drawn;
        }
    };
    var _layStrategies = {
        'onTop': function(pile, cards) {
            if ('[object Array]' === Object.prototype.toString.call( cards )) {
                for (var i = 0; i < cards.length; i++) {
                    pile.cards.push(cards[i]);
                }
            } else {
                pile.cards.push(cards);
            }
        }
    };
    var _card = function(cards, strategy) {
        if (cards.hasOwnProperty(strategy)) {
            return cards[strategy];
        }

        if (_drawStrategies.hasOwnProperty(strategy)) {
            var drawn = _drawStrategies[strategy](cards);
            if (drawn.length > 0) {
                return drawn[0];
            }
        }

        return {
            id: null,
            url: null,
            suit: null,
            rank: null,
            name: null
        };
    };

    var Pile = function(options) {
        var def = {
            sort: false,
            cards: [],

            remove: function(cardId) {
                for (var i = 0; i < this.cards.length; i ++) {
                    if (cardId === this.cards[i].id) {
                        this.cards.splice(i, 1);
                    }
                }
            },
            add: function(card, strategy) {
                if (_layStrategies.hasOwnProperty(strategy)) {
                    _layStrategies[strategy](this, card);
                }
            },
            card: function (strategy) {
                return _card(this.cards, strategy);
            }
        };

        return $.extend(def, options);
    };


    /** Move **/

    var _draw = function(move, cardsOrStrategy) {
        if ('string' === typeof cardsOrStrategy && _drawStrategies[cardsOrStrategy]) {
            move.cards = _drawStrategies[cardsOrStrategy](move.source.cards, move.options);
            move.state = 2;
        } else if ('object' === typeof cardsOrStrategy) {
            move.cards = cardsOrStrategy;
            move.state = 2;
        }
    };

    var _execute = function(move) {
        if (move.state < 2) {
            move.draw();
            if (move.state < 2) {
                return false;
            }
        }

        //console.debug('executing move with ' + move.cards.length + ' cards ' + ' from ' + move.source.id + ' to ' + move.target.id);
        for (var i = 0; i < move.cards.length; i++) {
            move.source.remove(move.cards[i].id);
            move.target.add(move.cards[i], move.layStrategy);
        }

        return true;
    };

    /**
     * a move can have different stati:
     * 0: uninitialized
     * 1: initialized: source and target are clear, which cards will be moved is unclear
     * 2: full: source, target and cards are defined
     *
     * @param source
     * @param target
     * @param options
     * @returns {{source: *, target: *, state: number}}
     * @constructor
     */
    var Move = function(source, target, options) {

        var layStrategy = 'onTop';
        var drawStrategy = options.hasOwnProperty('drawStrategy') ? options.drawStrategy : 'top';
        var state = 'object' === typeof source && 'object' === typeof target ? 1 : 0;
        var cards = [];

        return {
            source: source,
            target: target,
            options: options,
            layStrategy: layStrategy,
            drawStrategy: drawStrategy,
            state: state,
            cards: cards,

            execute: function() {
                return _execute(this);
            },
            card: function (strategy) {
                return _card(this.cards, strategy);
            },
            draw: function(cardsOrStrategy) {
                if ('undefined' === typeof cardsOrStrategy) {
                    cardsOrStrategy = this.drawStrategy;
                }
                _draw(this, cardsOrStrategy);
            }
        };
    };

    cgEngine = {
        utils: new Utils(),
        rules: new Rules(),
        Move: Move,
        Pile: Pile
    };
})(jQuery);