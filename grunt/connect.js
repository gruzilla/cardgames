var grunt = require('grunt');
var config = grunt.config.get('custom');

module.exports = {
    options: {
        port: config.serverPort,
        hostname: config.hostName,
        livereload: config.liveReloadPort
    },
    default: {
        options: {
            open: true,
            base: [
                '.tmp',
                config.srcPath
            ]
        }
    }
};