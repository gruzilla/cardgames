var grunt = require('grunt');
var config = grunt.config.get('custom');

module.exports = {
    usemin: {
        options: {
            title: 'Build complete',  // optional
            message: config.projectName + ' build finished successfully.' //required
        }
    }
};