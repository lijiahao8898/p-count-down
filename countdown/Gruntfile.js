'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.config.init({
        pkg: grunt.file.readJSON('package.json'),
        srcPath: 'src',
        distPath: 'build',

        clean: ['<%=distPath%>/*'],

        copy: {
        	package: {
                files: [{
                    expand: true,
                    cwd: './',
                    src: ['package.json'],
                    dest: '<%= distPath %>'
                }]
        	}
        },
        	
    	depconcat: {
    		main: {
    			files: [{
    				src: ['<%= srcPath%>/countdown.js'],
    				dest: '<%= distPath%>/countdown.debug.js'
    			}]
    		}
    	},
        
		uglify: {
           main: {
               files: [{
					expand: true,
					cwd: '<%= distPath %>/',
					src: ['*.debug.js'],
					dest: '<%= distPath %>/',
					ext: '.js'
			   }]
           }
        },

        watch: {
            main: {
                files: ['<%= srcPath%>/*.js', 'demo/*.js'],
                tasks: ['clean', 'copy', 'depconcat', 'uglify']
            }
        }
    });

    // grunt plugins
    grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-depconcat');

    // Default grunt
    grunt.registerTask('default', ['clean', 'copy', 'depconcat', 'uglify']);

};