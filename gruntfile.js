module.exports = function(grunt) {
    'use strict';

    var path = require('path');
    var cnf = {};

    cnf.projectName =       'gamelibrary'; // used as font family name and prefix for *.min.*-files
    cnf.srcPath =           'src';
    cnf.javascriptPath =    'javascript'; // relative to srcPath
    cnf.stylesheetPath =    'assets/stylesheets'; // relative to srcPath
    cnf.distributionPath =  'dist';
    cnf.testPath =          'test';
    cnf.serverPort =        8000;
    cnf.liveReloadPort =    35729;
    cnf.hostName =          'localhost'; // Change this to '0.0.0.0' to access the server from outside.

    // sets custom configuration
    grunt.config('custom', cnf);

    // measures the time each task takes
    require('time-grunt')(grunt);

    // load grunt config
    require('load-grunt-config')(grunt, {
        configPath: path.join(process.cwd(), 'grunt'),
        overridePath: path.join(process.cwd(), 'grunt-'+process.env.USER)
    });

    // autoload grunt tasks
    require('load-grunt-tasks')(grunt);

};