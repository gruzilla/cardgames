var grunt = require('grunt');
var config = grunt.config.get('custom');

module.exports = {
    default: {

        // Point to the files that should be updated when
        // you run `grunt bower-install`
        src: [
            config.srcPath + '/index.html'
        ],

        // Optional:
        // ---------
        // cwd: '',
        // exclude: [],
        // fileTypes: {},
        // ignorePath: '',
        dependencies: true,
        devDependencies: false
    },
    test: {
        src: [
            config.testPath + '/index.html'
        ],
        dependencies: true,
        devDependencies: true
    }
};