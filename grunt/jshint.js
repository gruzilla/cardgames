var grunt = require('grunt');
var cnf = grunt.config.get('custom');

module.exports = {
    // define the files to lint
    files: ['gruntfile.js', cnf.srcPath + '/' + cnf.javascriptPath + '/**/*.js', cnf.testPath + '/**/*.js'],
    // configure JSHint (documented at http://www.jshint.com/docs/)
    options: grunt.file.readJSON('.jshintrc')
};