var grunt = require('grunt');
var config = grunt.config.get('custom');

module.exports = {
    options: {
        removeFiles: true
    },
    default: {
        src: config.srcPath + '/index.html',
        blocks: {
            customScripts: {
                src: [
                    config.javascriptPath + '/*.js'
                ],
                cwd: config.srcPath
            },
            customStyles: {
                src: [
                    config.stylesheetPath + '/*.css'
                ],
                cwd: config.srcPath
            }
        }
    },
    test: {
        src: config.testPath + '/index.html',
        blocks: {
            customScripts: {
                src: [
                    config.javascriptPath + '/*.js'
                ],
                cwd: config.srcPath
            },
            testScripts: {
                src: [
                    'testScripts/*.js'
                ],
                cwd: config.testPath
            },
            customStyles: {
                src: [
                    config.stylesheetPath + '/*.css'
                ],
                cwd: config.srcPath
            }
        }
    }
};