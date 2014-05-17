var grunt = require('grunt');
var config = grunt.config.get('custom');

module.exports = {
    build: {
        files: [{
            dot: true,
            src: [
                '.tmp',
                config.distributionPath + '/*',
                '!' + config.distributionPath + '/.git*'
            ]
        }]
    },
    server: '.tmp'
};