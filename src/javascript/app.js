// Here, we configure RequireJS so that it knows where to look
// for things when we do e.g. `require('Ractive')`
require.config({

    urlArgs: 'bust=' + (new Date()).getTime(),
    baseUrl: '',
    paths: {
        
        // It's important that the paths are setup like this, because the
        // rv module has 'amd-loader' and 'Ractive' as dependencies
        // 'amd-loader': '../../../amd-loader',
        // rv: '../../../rv',
        ractive: 'bower_components/ractive/ractive',
        ractiveTouch: 'bower_components/ractive-touch/index',

        hammerjs: 'bower_components/hammerjs/hammer',

        text: 'bower_components/requirejs-plugins/lib/text',

        async: 'bower_components/requirejs-plugins/src/async',
        depend: 'bower_components/requirejs-plugins/src/depend',
        font: 'bower_components/requirejs-plugins/src/font',
        goog: 'bower_components/requirejs-plugins/src/goog',
        image: 'bower_components/requirejs-plugins/src/image',
        json: 'bower_components/requirejs-plugins/src/json',
        mdown: 'bower_components/requirejs-plugins/src/mdown',
        noext: 'bower_components/requirejs-plugins/src/noext',
        propertyParser: 'bower_components/requirejs-plugins/src/propertyParser'
    }
});

// Once we're all set up, we tell RequireJS where to start. When
// we say `require([ 'app' ])` we mean 'load the app.js file, and
// all its dependencies, then execute it'
require([ 'app/main' ]);