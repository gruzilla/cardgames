var grunt = require('grunt');
var config = grunt.config.get('custom');

module.exports = {
    options: {
        trueColor: true,
        precomposed: true,
        appleTouchBackgroundColor: '#e2b2c2',
        coast: true,
        windowsTile: true,
        tileBlackWhite: false,
        tileColor: 'auto',
        html: config.srcPath + '/index.html',
        HTMLPrefix: 'assets/images/favicons/'
    },
    build: {
        src: 'src/assets/favicon/favicon.png',
        dest: config.srcPath + '/assets/images/favicons'
    }
};