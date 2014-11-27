module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: ['client/js/*.js'],
				dest: 'htdocs/<%= pkg.name %>.js'
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
				sourceMap: '<%= pkg.name %>.map'
			},
			dist: {
				files: {
					'htdocs/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
				}
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
					{expand: true, src: ['client/img/*'], dest: 'htdocs/img/', filter: 'isFile'}
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
		}
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'less', 'copy']);
};
