var grunt = require('grunt');
var config = grunt.config.get('custom');

module.exports = {
    html: [config.distributionPath + '/{,*/}*.html'],
    // css: [config.distributionPath + '/css/{,*/}*.css'],
    // js: [config.distributionPath + '/js/{,*/}*.js'],
    options: {
        assetsDirs: [config.distributionPath + '/assets'],
        patterns: {
            js: [
                [
                    /.+.js/, 'Replacing references to javascript files'
                ]
            ]
        }
    }
};