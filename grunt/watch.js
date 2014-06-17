var grunt = require('grunt');
var config = grunt.config.get('custom');

module.exports = {
    javascript: {
        files: ['<%= jshint.files %>'],
        tasks: ['jshint', 'fileblocks']
    },
    css: {
        files: ['<%= compass.options.sassDir %>/**/*.scss'],
        tasks: ['compass:server', 'fileblocks']
    },
    bower: {
        files: ['bower.json'],
        tasks: ['bowerInstall']
    },
    livereload: {
        options: {
            livereload: config.liveReloadPort
        },
        files: [
            config.srcPath + '/**/*.html',
            '<%= jshint.files %>',
            '<%= compass.options.sassDir %>/**/*.scss'
        ]
    }
};