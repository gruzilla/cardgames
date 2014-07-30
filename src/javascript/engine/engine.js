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


    /** Game **/
    var Game = function(game) {

        var UNFOLD_ANGLE = 90; // degree
        var UNFOLD_DISTANCE = 40; // pixel
        var DEFAULT_UNFOLD_ANIMATION = 'extrude';

        var HAMMER_OPTIONS = {
            preventDefault: true,
            scaleThreshold: 0,
            dragMinDistance: 0,
            showTouches: true,
            holdTimeout: 350
        };

        var ANIMATION_DURATION = 300; // milli seconds
        var CARD_DRAG_ZINDEX = 2000; // zIndex
        var EDIT_PILE_MODE = false;

        var pileEditForm = $('#pile-form').detach();

        game = $.extend({
            backUrl: '',
            cardUrl: function() { // card
                return '';
            },
            onFold: function($card, $pile) {
                var pile = this.piles[$pile.attr('id')];
                if (pile && pile.hasOwnProperty('showSide') && 'back' === pile.showSide) {
                    $card.find('iframe').attr('src', this.backUrl);
                }
            },
            onUnFold: function($card, $pile) {
                var pile = this.piles[$pile.attr('id')];
                if (pile && pile.hasOwnProperty('showSide') && 'back' === pile.showSide) {
                    var $iFrame = $card.find('iframe');
                    $iFrame.attr('src', $iFrame.data('frontUrl'));
                }
            }
        }, game);

        $('.game-name').text(game.name);

        /************************************************+
         *
         * Everything we need for basic dom and object manipulation
         *
         *************************************************/

        var render = function () {
            var piles = [];
            for (var i in game.piles) {
                if (game.piles.hasOwnProperty(i)) {
                    piles.push(game.piles[i]);
                }
            }
            var pilesSelection = d3.select('#game-container')
                .selectAll('div.pile')
                .data(piles, function (datum) {
                    return datum.id;
                });

            pilesSelection
                .enter()
                .append('div')
                .attr('class', 'pile')
                .attr('id', function (datum) {
                    return datum.id;
                })
                .style({
                    top: function(datum) {
                        return datum.top || null;
                    },
                    left: function(datum) {
                        return datum.left || null;
                    }
                })
                .html(function (datum) {
                    return '<div class="card-container"></div><div class="name-container">' + datum.name + '</div>';
                })
                .each(function(datum) {
                    if (datum.rotate) {
                        $(this).css('rotate', datum.rotate);
                    }

                    if (datum.sort) {
                        datum.cards = datum.cards.sort();
                    }
                });

            pilesSelection
                .exit()
                .remove();

            var cardsSelection = pilesSelection
                .select('.card-container')
                .selectAll('div.card')
                .data(function (datum) {
                    return datum.cards;
                }, function (datum) {
                    return datum.id;
                });

            cardsSelection
                .enter()
                .append('div')
                .attr('class', 'card')
                .attr('id', function (datum) {
                    return 'card-' + datum.id;
                })
                .html(function (datum, cardIndex, pileIndex) {
                    var url = game.cardUrl(datum, piles[pileIndex]);
                    if ('front' === piles[pileIndex].showSide) {
                        return '<iframe frameborder="0" src="' +
                            url +
                            '" data-front-url="' + url + '"></iframe>';
                    } else {
                        return '<iframe frameborder="0" src="' +
                            game.backUrl +
                            '" data-front-url="' + url + '"></iframe>';
                    }
                });

            cardsSelection
                .exit()
                .remove();

            $('.pile').each(function (index, pile) {
                var $pile = $(pile);

                if ($pile.data('foldFlag')) {
                    unfold($pile, 0); // animationDuration
                }
            });
        };

        var unfold = function ($pile, animationDuration, method) {

            if (undefined === animationDuration) {
                animationDuration = ANIMATION_DURATION;
            }
            if (undefined === method) {
                method = DEFAULT_UNFOLD_ANIMATION;
            }

            var pile = game.piles[$pile.attr('id')];

            if (!pile) {
                return;
            }

            if (pile.hasOwnProperty('unfoldAble') && false === pile.unfoldAble) {
                return;
            }

            $pile.addClass('unfolded');

            if (pile && pile.unfoldAnimation) {
                method = pile.unfoldAnimation;
            }

            var $cards = $pile.find('.card');

            var angleStep = UNFOLD_ANGLE / ($cards.length - 1);
            var angle = -UNFOLD_ANGLE / 2;

            var circles = [
                {
                    amount: 8,
                    center: {
                        x: 0,
                        y: 0
                    },
                    radius: $pile.height() / 2
                },
                {
                    amount: 16,
                    center: {
                        x: 0,
                        y: 0
                    },
                    radius: $pile.height()
                },
                {
                    amount: 32,
                    center: {
                        x: 0,
                        y: 0
                    },
                    radius: $pile.height() * 1.5
                }
            ];
            var circle = function($element, index, axis) {
                var cIndex = 0;
                var cAmount = 0;
                for (var c = 0; c < circles.length; c++) {
                    cAmount += circles[c].amount;
                    if (index >= cAmount) {
                        cIndex++;
                    } else {
                        break;
                    }
                }
                cIndex = Math.min(circles.length-1, cIndex);
                var circle = circles[cIndex];
                var param = 2 * Math.PI / circle.amount * index;

                if ('x' === axis) {
                    return circle.center.x + Math.round(circle.radius * Math.cos(param) * 100) / 100;
                }

                if ('y' === axis) {
                    return circle.center.y + Math.round(circle.radius * Math.sin(param) * 100) / 100;
                }

                return 0;
            };

            $cards.each(function(index, card) {
                var $card = $(card);
                var transition = {};
                var zIndex = index;

                switch (method) {
                case 'extrude':
                    transition = {
                        translate: [UNFOLD_DISTANCE * index, 0]
                    };
                    break;
                case 'circle':
                    transition = {
                        translate: [circle($card, index, 'x'), circle($card, index, 'y')]
                    };
                    zIndex = $cards.length - index;
                    break;
                default:
                    transition = {
                        rotate: (angle + angleStep * index) + 'deg',
                        transformOrigin: '0 ' + $card.height() + 'px'
                    };
                    break;
                }

                var complete = function() {
                    game.onUnFold($(this), $pile);
                };

                $card
                    .css({
                        zIndex: zIndex
                    })
                    .transition(transition, animationDuration, complete)
                    .data({
                        foldFlag: true,
                        oZIndex: index
                    });
            });
        };

        var fold = function ($pile, method) {
            if (undefined === method) {
                method = DEFAULT_UNFOLD_ANIMATION;
            }

            var pile = game.piles[$pile.attr('id')];
            if (pile && pile.unfoldAnimation) {
                method = pile.unfoldAnimation;
            }

            $pile.find('.card').each(function(index, card) {
                var $card = $(card);
                var transition = {};

                switch (method) {
                case 'extrude':
                case 'circle':
                    transition = {
                        translate: [0, 0]
                    };
                    break;
                default:
                    transition = {
                        rotate: 0
                    };
                    break;
                }

                var complete = function() {
                    game.onFold($(this), $pile);
                };

                $card.transition(
                        transition,
                        ANIMATION_DURATION,
                        complete
                    )
                    .css({
                        zIndex: index
                    })
                    .data({
                        foldFlag: false
                    });
            });

            window.setTimeout(function() {
                $pile.removeClass('unfolded');
            }, ANIMATION_DURATION);
        };


        var debug = function() {
            var msg = 'piles: ';
            for (var i in game.piles) {
                if (game.piles.hasOwnProperty(i)) {
                    msg += '\n' + i + ' : ' + game.piles[i].cards.length;
                }
            }
            // console.debug(msg);
        };

        /************************************************+
         *
         * start and render the game
         *
         *************************************************/


        // start game.
        // execute initial moves
        while(game.moves.length > 0) {
            var move = game.moves.pop();
            if (cgEngine.rules.checkMove(move)) {
                move.execute();
            }
        }

        debug();

        // render game
        render();

        /************************************************+
         *
         * Everything we need for saving / editing
         *
         *************************************************/

        $('#save').off().on('click', function() {
            var content = 'game.piles = [';
            var $piles = $('.pile');
            $piles.each(function(index, pile) {
                var $pile = $(pile);
                var offset = $pile.offset();
                var pileObject = game.piles[$pile.attr('id')];
                pileObject.top = offset.top + 'px';
                pileObject.left = offset.left + 'px';

                var cards = [];
                $pile.find('.card').each(function(index, card) {
                    cards.push($(card).attr('id').split('card-')[1]);
                });

                pileObject.cards = cards;

                content += JSON.stringify(pileObject);
                if (index !== $piles.length - 1) {
                    content += ',';
                }
            });

            content += '];';

            var uriContent = 'data:application/octet-stream,' + encodeURIComponent(content);
            window.open(uriContent, 'game.json');
        });

        $('#editPile').off().on('click', function() {
            if (false === EDIT_PILE_MODE) {
                EDIT_PILE_MODE = true;

                $('#editPile').get(0).disabled = true;
                $('.pile').toggleClass('edit');
            }
        });
        $('#modal .close').off().on('click', function() {
            $('#modal').hide();
        });

        /************************************************+
         *
         * Everything we need for drag+drop, transform or any other ui
         *
         *************************************************/

        var currentDragTarget = null;
        var $currentDragElement = null;

        var getCurrentDragTarget = function(event) {
            if (null === currentDragTarget) {
                currentDragTarget = 'card';
            }

            return findTargetByClassName(event, currentDragTarget);
        };

        var findTargetByClassName = function(eventOrNode, className) {
            var el = eventOrNode instanceof Node ? eventOrNode : eventOrNode && eventOrNode.target ? eventOrNode.target : null;
            if (!el) {
                return null;
            }

            while (el.className && el.className.search(className) < 0 && el.parentNode) {
                el = el.parentNode;
            }

            if (!el.parentNode || el.className.search(className) < 0) {
                return null;
            }

            return el;
        };

        var cleanDragendCss = function() {
            if (null === currentDragTarget) {
                return;
            }

            if (null === $currentDragElement) {
                var el = getCurrentDragTarget(event);
                if (el && !el.classList.contains('pile') && !el.classList.contains('card')) {
                    currentDragTarget = null;
                    return;
                }
                $currentDragElement = $(el);
            }

            var css = {};
            switch (currentDragTarget) {
            case 'pile':
                css = {
                    zIndex: $currentDragElement.data('oZIndex'),
                    boxShadow: 'none'
                };
                break;
            case 'card':
                css = {
                    zIndex: $currentDragElement.data('oZIndex'),
                    display: 'block',
                    top: 0,
                    left: 0
                };
                break;
            }
            $currentDragElement.css(css);

            currentDragTarget = null;
            $currentDragElement = null;
        };

        var editPile = function($pile) {
            EDIT_PILE_MODE = false;
            $('.pile').removeClass('edit');
            $('#editPile').get(0).disabled = false;

            var pile = game.piles[$pile.attr('id')];
            if (!pile) {
                return;
            }

            pile = $.extend(false, {}, pile);
            delete pile.cards;

            var $modal = $('#modal');
            $modal
                .show()
                .find('.modal-wrapper')
                .css({
                    height: '300px',
                    top: Math.max(0, ($(document).height() - 300) / 2)
                })
                .find('.container')
                .html(pileEditForm)
            ;

            var form = $modal.find('form').get(0);
            form.name.value = pile.name;
            form.incoming.value = pile.hasOwnProperty('incoming') ? pile.incoming.join('\n\n') : '';
            form.outgoing.value = pile.hasOwnProperty('outgoing') ? pile.outgoing.join('\n\n') : '';

            $modal.find('.save-pile').one('click', function(event) {
                event.stopPropagation();
                event.preventDefault();

                $modal.hide();

                var oPile = game.piles[$pile.attr('id')];
                oPile.name = form.name.value;
                $pile.find('.name-container').html(oPile.name);

                oPile.incoming = form.incoming.value.split('\n').filter(function(item) {return '' !== item.trim(); });
                oPile.outgoing = form.outgoing.value.split('\n').filter(function(item) {return '' !== item.trim(); });
            });
        };

        var $gameContainer = $('#game-container');
        $gameContainer.hammer(HAMMER_OPTIONS).on('dragstart', function(event) {

            // fetch the currently dragged element
            var el = getCurrentDragTarget(event);
            if (!el || !(el.classList.contains('pile') || el.classList.contains('card'))) {
                return;
            }
            $currentDragElement = $(el);

            // save the current z-index and pull the element above all others
            $currentDragElement.data('oZIndex', $currentDragElement.css('zIndex'));
            $currentDragElement.css('zIndex', CARD_DRAG_ZINDEX);

            if ('card' === currentDragTarget) {
                // consider the transformation, when dragging a card
                var pile = findTargetByClassName(event, 'pile');
                if (!pile) {
                    return;
                }
                var st = window.getComputedStyle(
                    pile,
                    null
                );
                var tr = st.getPropertyValue('-webkit-transform') ||
                    st.getPropertyValue('-moz-transform') ||
                    st.getPropertyValue('-ms-transform') ||
                    st.getPropertyValue('-o-transform') ||
                    st.getPropertyValue('transform') ||
                    null;

                var values = [1, 0, 0, 1, 0, 0];
                if (null !== tr && 'none' !== tr && '' !== tr) {
                    values = tr.split('(')[1];
                    values = values.split(')')[0];
                    values = values.split(',');
                    values = values.map(parseFloat);
                }

                $currentDragElement.data('pileTransform', values);
            }
        }).on('drag', function(event) {
            if (null === $currentDragElement) {
                return;
            }

            var css = {};

            switch (currentDragTarget) {
            case 'pile':
                var w = $currentDragElement.width() / 2;
                var h = $currentDragElement.height() / 2;
                css = {
                    top: event.gesture.center.pageY - h,
                    left: event.gesture.center.pageX - w
                };
                break;
            case 'card':
                var dT = $currentDragElement.data('pileTransform');

                var dX = event.gesture.deltaX;
                var dY = event.gesture.deltaY;

                var nX = dT[0] * dX + dT[1] * dY;
                var nY = dT[2] * dX + dT[3] * dY;

                css = {
                    left: nX,
                    top: nY
                };
                break;
            }

            $currentDragElement.css(css);
        }).on('hold', function(event) {
            currentDragTarget = 'pile';

            var $target = $(getCurrentDragTarget(event));
            if (0 === $target.length) {
                return;
            }

            $target.css({
                boxShadow: '3px 3px 6px 4px #999'
            });
        }).on('dragend', function(event) {
            if (null === $currentDragElement) {
                return;
            }

            switch (currentDragTarget) {
            case 'pile':
                break;
            case 'card':
                $currentDragElement.hide();

                var dropPile = document.elementFromPoint(
                    event.gesture.center.pageX - window.scrollX,
                    event.gesture.center.pageY - window.scrollY
                );

                dropPile = findTargetByClassName(dropPile, 'pile');
                if (!dropPile) {
                    return;
                }

                var sourcePile = findTargetByClassName($currentDragElement[0], 'pile');
                if (!sourcePile) {
                    return;
                }

                if (dropPile.parentNode &&
                    sourcePile !== dropPile &&
                    dropPile.className.search('pile') >= 0
                    ) {
                    //var index = $currentDragElement.index();
                    var cardId = $currentDragElement.attr('id').substr('card-'.length);
                    var sd = $(sourcePile).attr('id');
                    var td = $(dropPile).attr('id');

                    var move = new cgEngine.Move(game.piles[sd], game.piles[td], {
                        drawStrategy: 'byId',
                        drawCardId: cardId
                    });

                    if (cgEngine.rules.checkMove(move)) {
                        currentDragTarget = null;
                        $currentDragElement = null;

                        move.execute();
                        debug();
                        render();

                        // do not manipulate current element, stop execution
                        return;
                    } else {
                        var $dP = $(dropPile);
                        var origColor = $dP.css('border-color');
                        var origBgColor = $dP.css('background-color');
                        $dP.css({
                            borderColor: '#FF0000',
                            backgroundColor: '#FFCCCC'
                        }).animate({
                            borderColor: origColor,
                            backgroundColor: origBgColor
                        });
                    }
                }
                break;
            }

            cleanDragendCss();
        }).on('tap', function(event) {
            var $modal = $(findTargetByClassName(event, 'modal'));
            if ($modal.length > 0) {
                $modal.stop(true, true).hide();
                return;
            }
            var $pile = $(findTargetByClassName(event, 'pile'));
            if (0 === $pile.length) {
                return;
            }

            if (true === EDIT_PILE_MODE) {
                editPile($pile);
                return;
            }

            var foldFlag = $pile.data('foldFlag');
            if (foldFlag) {
                fold($pile);
                $pile.data('foldFlag', false);
            } else {
                unfold($pile);
                $pile.data('foldFlag', true);
            }
        }).on('transformstart', function (event) {
            var $el = $(findTargetByClassName(event, 'pile'));
            if (0 === $el.length) {
                return;
            }

            $el.data('oscale', {
                height: $el.height(),
                width: $el.width()
            });
        }).on('transform', function (event) {
            var $el = $(findTargetByClassName(event, 'pile'));
            if (0 === $el.length) {
                return;
            }

            var oldScale = $el.data('oscale');
            var w = $el.width()/2;
            var h = $el.height()/2;
            $el.css({
                rotate: event.gesture.rotation,
                width: oldScale.width * event.gesture.scale,
                height: oldScale.height * event.gesture.scale,
                left: event.gesture.center.pageX - w,
                top: event.gesture.center.pageY - h
            });
            $el.find('.card').each(function() {
                var $card = $(this);
                $card.css({
                    transformOrigin: '0 ' + $card.height() + 'px'
                });
            });
        })
            .on('mouseup, release', cleanDragendCss)
        ;

    };

    cgEngine = {
        utils: new Utils(),
        rules: new Rules(),
        Move: Move,
        Pile: Pile,
        Game: Game
    };
})(jQuery);