var grunt = require('grunt');
var config = grunt.config.get('custom');

module.exports = {
    html: {
        cwd: config.srcPath,
        expand: true,
        dest: config.distributionPath,

        src: [
            'index.html'
        ]
    },
    fonts: {
        cwd: config.srcPath,
        expand: true,
        dest: config.distributionPath, // + '/assets/fonts',

        src: [
            'assets/fonts/**'
        ]
    },
    images: {
        cwd: config.srcPath,
        expand: true,
        dest: config.distributionPath, // + '/assets/images',

        src: [
            'assets/images/**'
        ]
    },
    decks: {
        cwd: config.srcPath,
        expand: true,
        dest: config.distributionPath, // + '/assets/images',

        src: [
            'assets/decks/**'
        ]
    }
};