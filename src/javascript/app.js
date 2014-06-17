var UNFOLD_ANGLE = 90; // degree
var UNFOLD_DISTANCE = 40; // pixel
var DEFAULT_UNFOLD_ANIMATION = 'extrude';
var PILES = [
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
        left: '48%'
    },
    {
        id: 'player1',
        name: 'Spieler 1',
        unfoldAnimation: 'rotate',
        cards: [],
        top: '8%',
        left: '40%',
        rotate: '180deg'
    },
    {
        id: 'player2',
        name: 'Spieler 2',
        unfoldAnimation: 'rotate',
        cards: [],
        top: '75%',
        left: '40%'
    }
];
var MOVES = [
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

var HAMMER_OPTIONS = {
    preventDefault: true,
    scaleThreshold: 0,
    dragMinDistance: 0,
    showTouches: true,
    holdTimeout: 150
};

var ANIMATION_DURATION = 300; // milli seconds
var CARD_DRAG_ZINDEX = 2000; // zIndex

(function ($) {
    'use strict';

    var render = function () {
        var pilesSelection = d3.select('#container')
            .selectAll('div.pile')
            .data(PILES, function (datum) {
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
                return datum;
            });

        cardsSelection
            .enter()
            .append('div')
            .attr('class', 'card')
            .attr('id', function (datum) {
                return 'card-' + datum;
            })
            .html(function (datum) {
                return '<iframe frameborder="0" src="assets/decks/uno/cards.svg#' + datum + '"></iframe>';
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

    var move = function(from, to, cardName, cardIndex) {

        for (var i = 0; i < PILES.length; i++) {
            if (PILES[i].id === to) {
                PILES[i].cards.push(cardName);
            }
            if (PILES[i].id === from) {
                PILES[i].cards.splice(cardIndex, 1);
            }
        }
    };

    var moves = function(moves) {
        for (var i = 0; i < moves.length; i++) {
            var from = moves[i][0];
            var to = moves[i][1];
            var name = 0;
            if (moves[i].length > 1) {
                name = moves[i][2];
            }
            var index = 0;
            if (moves[i].length > 2) {
                index = moves[i][3];
            }

            var fp = getPile(from);

            index = fp.cards.length - 1;
            name = fp.cards[index];

            move(from, to, name, index);
        }
    };

    var unfold = function ($pile, animationDuration, method) {

        $pile.addClass('unfolded');

        if (undefined === animationDuration) {
            animationDuration = ANIMATION_DURATION;
        }
        if (undefined === method) {
            method = DEFAULT_UNFOLD_ANIMATION;
        }

        var pile = getPile($pile.attr('id'));
        if (pile && pile.unfoldAnimation) {
            method = pile.unfoldAnimation;
        }

        var $cards = $pile.find('.card');

        var angleStep = UNFOLD_ANGLE / ($cards.length - 1);
        var angle = -UNFOLD_ANGLE / 2;

        $cards.each(function(index, card) {
            var $card = $(card);
            var transition = {};

            switch (method) {
            case 'extrude':
                transition = {
                    translate: [UNFOLD_DISTANCE * index, 0]
                };
                break;
            default:
                transition = {
                    rotate: (angle + angleStep * index) + 'deg',
                    transformOrigin: '0 ' + $card.height() + 'px'
                };
                break;
            }

            $card
                .css({
                    zIndex: index
                })
                .transition(transition, animationDuration)
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

        var pile = getPile($pile.attr('id'));
        if (pile && pile.unfoldAnimation) {
            method = pile.unfoldAnimation;
        }

        $pile.find('.card').each(function(index, card) {
            var $card = $(card);
            var transition = {};

            switch (method) {
            case 'extrude':
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

            $card.transition(
                transition,
                ANIMATION_DURATION
            ).css({
                zIndex: index
            }).data({
                foldFlag: false
            });
        });
        
        window.setTimeout(function() {
            $pile.removeClass('unfolded');
        }, ANIMATION_DURATION);
    };

    /*
    var showCard = function ($delegate, $element) {
        $delegate.find('.card').each(function(index, item) {
            var zIndex = $(item).data('oZIndex');
            $(item).css({
                zIndex: zIndex ? zIndex : ''
            });
        });
        if (!$element || !$element.hasClass('card')) {
            return;
        }
        $element.css({
            zIndex: CARD_SHOW_ZINDEX
        });
    };
    */


    var getPile = function(id) {
        for (var i = 0; i < PILES.length; i++) {
            if (PILES[i].id === id) {
                return PILES[i];
            }
        }
        return null;
    };

    moves(MOVES);
    render();

    $('#save').off().on('click', function() {
        var content = 'PILES = [';
        var $piles = $('.pile');
        $piles.each(function(index, pile) {
            var $pile = $(pile);
            var offset = $pile.offset();
            var pileObject = getPile($pile.attr('id'));
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

    var currentDragTarget = null;
    var $currentDragElement = null;

    var getCurrentDragTarget = function(event) {
        if (null === currentDragTarget) {
            currentDragTarget = 'card';
        }

        return findTargetByClassName(event, currentDragTarget);
    };

    var findTargetByClassName = function(eventOrNode, className) {
        var el = eventOrNode instanceof Node ? eventOrNode : eventOrNode.target ? eventOrNode.target : null;
        if (!el) {
            return null;
        }
        while (el.className && el.className.search(className) < 0 && el.parentNode) {
            el = el.parentNode;
        }

        if (!el.parentNode) {
            return null;
        }

        return el;
    };

    var $body = $('body');
    $body.hammer(HAMMER_OPTIONS).on('dragstart', function(event) {

        // fetch the currently dragged element
        var el = getCurrentDragTarget(event);
        $currentDragElement = $(el);

        // save the current z-index and pull the element above all others
        $currentDragElement.data('oZIndex', $currentDragElement.css('zIndex'));
        $currentDragElement.css('zIndex', CARD_DRAG_ZINDEX);

        if ('card' === currentDragTarget) {
            // consider the transformation, when dragging a card
            var pile = findTargetByClassName(event, 'pile');
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

        $(getCurrentDragTarget(event)).css({
            boxShadow: '3px 3px 6px 4px #999'
        });
    }).on('dragend', function(event) {
        if (null === $currentDragElement) {
            return;
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
            $currentDragElement.hide();

            var dropPile = document.elementFromPoint(
                event.gesture.center.pageX,
                event.gesture.center.pageY
            );

            dropPile = findTargetByClassName(dropPile, 'pile');

            var sourcePile = findTargetByClassName($currentDragElement[0], 'pile');

            if (!dropPile ||
                !dropPile.parentNode ||
                sourcePile === dropPile ||
                dropPile.className.search('pile') < 0
                ) {
                css = {
                    zIndex: $currentDragElement.data('oZIndex'),
                    display: 'block',
                    top: 0,
                    left: 0
                };
            } else {

                var index = $currentDragElement.index();
                var name = $currentDragElement.attr('id').substr('card-'.length);
                var sd = $(sourcePile).attr('id');
                var td = $(dropPile).attr('id');

                currentDragTarget = null;
                $currentDragElement = null;
                move(sd, td, name, index);

                render();

                return;
            }
            break;
        }
        $currentDragElement.css(css);

        currentDragTarget = null;
        $currentDragElement = null;
    }).on('tap', function(event) {
        var $pile = $(findTargetByClassName(event, 'pile'));

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
        if (!$el) {
            return;
        }

        $el.data('oscale', {
            height: $el.height(),
            width: $el.width()
        });
    }).on('transform', function (event) {
        var $el = $(findTargetByClassName(event, 'pile'));
        if (!$el) {
            return;
        }

        var oldScale = $el.data('oscale');
        var w = $el.width()/2;
        var h = $el.height()/2;
        $el.css({
            rotate: event.gesture.rotation,
//                transformOrigin: w + 'px ' + h + 'px',
            width: oldScale.width * event.gesture.scale,
            height: oldScale.height * event.gesture.scale,
            left: event.gesture.center.pageX - w,
            top: event.gesture.center.pageY - h
        });
    })
    /*
    .on('mouseup', function() {
        currentDragTarget = null;
        $currentDragElement = null;
    })
    */
    ;

})(jQuery);
