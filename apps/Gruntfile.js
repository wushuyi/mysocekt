/*global module:false*/
module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            options: {
                optimize: 'uglify2',
                uglify2: {
                    output: {
                        beautify: false
                    },
                    compress: {
                        //'drop_console': true,
                        sequences: false,
                        'global_defs': {
                            DEBUG: false
                        }
                    },
                    //warnings: true,
                    mangle: false
                }
            },
            compileLibs: {
                options: {
                    appDir: 'assets',
                    dir: '../bulid',
                    mainConfigFile: 'assets/js/common.js',
					baseUrl: './',
                    modules: [
                        {
                            'name': './js/common',
                            'include': [
                                'domReady',
                                'jquery',
                                'lodash',
                                'localforage'
                            ]
                        },
						{
							'name': './js/apps/functions',
							'exclude': [
								'socketio',
                                'domReady',
                                'jquery',
                                'lodash',
                                'localforage'
							]
						}
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['requirejs']);
};