var grunt = require('grunt');
var config = grunt.config.get('custom');

module.exports = {
    html: config.srcPath + '/index.html',
    options: {
        dest: config.distributionPath
    }
};
