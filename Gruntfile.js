module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				separator: ';',
				sourceMap: true
			},
			dist: {
				src: ['client/js/*.js'],
				dest: 'tmp/<%= pkg.name %>.js'
			}
		},
		uglify: {
			local : {
				options: {
					banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
					sourceMap: '<%= pkg.name %>.map',
					sourceMapIncludeSources : true,
					sourceMapIn : '<%= concat.dist.dest %>.map'
				},
				src : 'tmp/<%= pkg.name %>.js',
				dest : 'htdocs/<%= pkg.name %>.min.js'
			},
			bower : {
				src : '<%= bower_concat.all.dest %>',
				dest : 'htdocs/bower.min.js'
			}
		},
		less: {
			development: {
				options: {
					paths: ["client/style"]
				},
				files: {
					"htdocs/style.css": "client/style/style.less"
				}
			},
			production: {
				options: {
					paths: ["style"],
					cleancss: true,
				},
				files: {
					"htdocs/style.css": "client/style/style.less"
				}
			}
		},
		copy: {
			images: {
				files: [
					{expand: true, cwd: 'client', src: ['img/**'], dest: 'htdocs'}
				]
			},
			html: {
				files: [
					{expand: true, cwd: 'client', src: ['*.html'], dest: 'htdocs'}
				]
			}
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				eqnull: true,
				browser: true,
				globals: {
					jQuery: true
				}
			},
			beforeconcat: ['client/js/*.js']
		},
		clean : {
			build: ["tmp"],
			release : ["htdocs/"]
		},
		bower_concat: {
			all: {
				dest: 'tmp/bower.js',
				dependencies: {
					'Leaflet.awesome-markers': 'leaflet'
				},
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-bower-concat');
	grunt.registerTask('default', ['clean:release', 'jshint', 'concat', 'bower_concat', 'uglify', 'less', 'copy', 'clean:build']);
};
