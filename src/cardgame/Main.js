// define our main application, with an 'init' method to call when
// the DOM is ready etc
define('cardgame/Main', [ 'ractive', 'hammerjs'], function ( Ractive, Hammer) {

    'use strict';

    var Main = function(gameContainerSelector, game) {

        this.gameContainerSelector = gameContainerSelector;
        this.game = game;

        this.data = {
            game: this.game,

            cardUrl: this.game.cardUrl.bind(this.game)
        };

        this.mainView = null;
    };

    Main.prototype.initializeRactive = function(mainTemplate) {

        // render our main view
        this.mainView = new Ractive({
            el: this.gameContainerSelector,
            template: mainTemplate,
            data: this.data,
            partials: {
                pile: this.game.getPartial('pile')
            }
        });

        this.mainView.on(
            'unfold',
            this.game.unfold.bind(this.game)
        );

        this.game.run();
    };

    Main.prototype.run = function () {
        // evil hack for ractiveTouch, that only supports CommonJS not AMD :(
        window.Ractive = Ractive;
        window.Hammer = Hammer;

        require(
            [
                'text!cardgame/templates/main.html',
                'ractiveTouch'
            ],
            this.initializeRactive.bind(this)
        );
    };

    Main.prototype.getData = function() {
        return this.data;
    };


    return Main;
});