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
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
				sourceMap: '<%= pkg.name %>.map',
				sourceMapIn : '<%= concat.dist.dest %>.map',
				sourceMapIncludeSources : true
			},
			dist: {
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
		}
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.registerTask('default', ['clean:release', 'jshint', 'concat', 'uglify', 'less', 'copy', 'clean:build']);
};
