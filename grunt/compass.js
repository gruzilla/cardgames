var grunt = require('grunt');
var config = grunt.config.get('custom');

module.exports = {
    options: {
        sassDir: config.srcPath + '/assets/stylesheets',
        cssDir: config.srcPath + '/assets/stylesheets',
        fontsDir: config.srcPath + '/assets/fonts',
        relativeAssets: false
    },
    build: {
        options: {
            environment: 'production',
            cssDir: 'dist/css',
            httpFontsPath: '../assets/fonts'
        }
    },
    server: {
        options: {
            environment: 'development',
            httpFontsPath: '../fonts',
            sourcemap: true,
            debugInfo: true
        }
    }
};