# ma seed
my seed for frontend web projects.

# requirements
* linux or osx - you wont have fun on windows
* bower
* npm
* grunt
* compass
* jshint
* phantomjs
* imagemagick
* fontforge
* mocha
* a notification system like notify-send

# basic taskflow
## for server:
using server-target where applicable

* clean the server temporary folders
* wire dependencies in source-files (fileblocks + bowerInstall + favicons)
* run server (concurrent + connect)
* watch over changes and run the required tasks

## for building:
using build-target where applicable

* clean all distribution-directories
* wire dependencies in source-files (fileblocks + bowerInstall + favicons)
* create and inject favicons in source directory
* copy html + images
* concurrently do (save build-time):
    * handleFont: build the font out of svg-tiles
    * handleCss: run all files through compass and generate css files in .tmp folder
    * handleImages
* copy fonts
* minify css+javascript (usemin + uglifyjs)

## for testing
only runs the jshint and mocha. no further testing done atm.

## default:

* clean everything
* create and inject favicons in source directory
* wire dependencies in source-files (fileblocks + bowerInstall + favicons)
* handleFont: build the font out of svg-tiles


# usage
* check the requirements
* fork this repo
* run ```npm install```
* run ```bower update```
* change gruntfile.js if necessary (configuration in top of file)
* change any task-configuration if necessary (see grunt folder for each task, also see the task-flow above for further reading)
* add your bower requirements and fix main-files if necessary in the override section (i use [bowerInstall](https://github.com/stephenplusplus/grunt-bower-install) which uses [wiredep](https://www.npmjs.org/package/wiredep‎))
* add svg-icons to src/assets/icons (make sure fontforge is correctly installed, its used by grunt-webfont)
* change your src/assets/favicon/favicon.png
* run ```grunt server``` to start the local server for your project (check top of gruntfile for port/hostname)
* run ```grunt build``` to create a distribution in the dist-folder

# grunt targets
* default
* build
* server
* test
* html, css, js - used by usemin
* html, css, js, livereload - used by watch
* html, fonts, images - used by copy