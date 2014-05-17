var grunt = require('grunt');
var config = grunt.config.get('custom');

module.exports = {
    build: {
        src: config.srcPath + '/assets/icons/*.svg',
        dest: config.srcPath + '/assets/fonts',
        syntax: 'bem',

        templateOptions: {
            baseClass: 'glyph-icon',
            classPrefix: 'glyph_',
            mixinPrefix: 'glyph-'
        },

        destCss: config.srcPath + '/assets/stylesheets/modules',

        htmlDemo: false,
        htmlDemoTemplate: '',
        destHtml: config.srcPath + '/assets/fonts/demo.html',

        options: {
            font: config.projectName,
            styles: 'font,icon',
            types: 'eot,woff,ttf,svg',
            stylesheet: 'scss',
            relativeFontPath: '../../fonts'
        }
    }
};