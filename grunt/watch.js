var grunt = require('grunt');
var config = grunt.config.get('custom');

module.exports = {
    javascript: {
        files: ['<%= jshint.files %>'],
        tasks: ['jshint', 'fileblocks']
    },
    css: {
        files: ['<%= compass.server.options.sassDir %>/**/*.scss'],
        tasks: ['compass:server', 'fileblocks']
    },
    livereload: {
        options: {
            livereload: '<%= connect.options.livereload %>'
        },
        files: [
            config.srcPath + '/**/*.html',
            '<%= copy.html.src %>',
            '<%= jshint.files %>',
            '<%= compass.server.options.sassDir %>/**/*.scss'
        ]
    }
};