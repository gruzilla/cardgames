var grunt = require('grunt');
var config = grunt.config.get('custom');

module.exports = {
    default: {
        options: {
            reporter: 'XUnit'
        },
        src: [ config.testPath + '/**/*.html'],
        dest: config.testPath + '/output/xunit.out'
    }
};