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
					mangle : false,
					banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
					sourceMap: '<%= pkg.name %>.map',
					sourceMapIncludeSources : true,
					sourceMapIn : '<%= concat.dist.dest %>.map'
				},
				src : 'tmp/<%= pkg.name %>.js',
				dest : 'htdocs/<%= pkg.name %>.min.js'
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
			},
			bower: {
				files : [
					{expand: true, cwd: '.', src: ['bower_components/**'], dest: 'htdocs'}
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
			client: ['client/js/*.js'],
			server: ['server/src/*.js']
		},
		clean : {
			build: ["tmp"],
			release : ["htdocs/"]
		},
		wiredep: {
			task: {
				src: [
					'htdocs/*.html'
				],
				options: {
					directory : "htdocs/bower_components"
				}
			}
		},
		watch: {
			scripts: {
				files: ['client/**'],
				tasks: ['default'],
				options: {
					spawn: false,
				},
			},
		},
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-wiredep');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.registerTask('client', ['jshint:client', 'concat', 'uglify', 'less', 'copy', 'wiredep']);
	grunt.registerTask('server', ['jshint:server']);
	grunt.registerTask('default', ['server', 'client']);
};
