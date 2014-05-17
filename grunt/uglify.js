var grunt = require('grunt');
var config = grunt.config.get('custom');

module.exports = {
    options: {
        mangle: false,
        compress: true,
        sourceMap: true,

        // the banner is inserted at the top of the output
        banner: '/*! ' + config.projectName + ' <%= grunt.template.today("dd-mm-yyyy") %> */\n'
    }
}