var grunt = require('grunt');
var config = grunt.config.get('custom');

module.exports = {
    options: {
        cache: false
    },

    build: {
        files: [
            {
                expand: true,
                cwd: config.distributionPath + '/assets/images/',
                dest: config.distributionPath + '/assets/images/',
                src: ['**/*.{png,jpg,gif}']
            }
        ]
    }
};