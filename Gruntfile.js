var FS = require('fs');

module.exports = function(grunt) {
	var date = Date.now();
	var testfiles = [
		'server/tests/require.js',
		'server/tests/test_cache.js',
		'server/tests/test_client.js',
		'server/tests/test_server.js',
		'server/tests/test_telnet.js',
		'server/tests/test_websocket.js',
		'server/tests/test_database_fail.js'
	];
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
		mochacov: {
			options : {
				timeout : 5000,
				require: ['should']
			},
			server_html: {
				options: {
					reporter: 'html-cov',
					output: 'coverage/server_' + date + '.html'
				},
				src: testfiles
			},
			server_json: {
				options: {
					reporter: 'json-cov',
					output: 'coverage/server_' + date + '.json'
				},
				src: testfiles
			},
			server_spec: {
				options: {
					reporter: 'spec'
				},
				src: testfiles
			}
		},
		build: {
			server: ['jshint:server'],
			client: ['jshint:client', 'concat', 'uglify', 'less', 'copy', 'wiredep']
		},
		test: {
			server: ['mochacov:server_spec', 'mochacov:server_html', 'mochacov:server_json'],
			client: []
		},
		jsdoc : {
			server : {
				src: ['server/src/*.js'],
				options: {
					destination: 'doc/server'
				}
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-wiredep');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-mocha-cov');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.registerMultiTask('test', 'Run tests and code coverage for server and client.', function() {
		grunt.task.run(this.data);
	});
	grunt.registerMultiTask('build', 'Build server and client.', function() {
		grunt.task.run(this.data);
	});
	grunt.registerTask('printcoverage', 'Print the overall coverage the the commandline.', function() {
		var json = require('./coverage/server_' + date + '.json');
		console.log("Coverage: " + json.coverage + "%");
		console.log("HTML-Report for Coverage stored at:");
		console.log('server_' + date + '.html');
	});
	grunt.registerTask('linkcoverage', 'Link the coverageresult to server.html.', function(done) {
		var done = this.async;
		FS.unlink('coverage/server_latest.html', function() {
			FS.symlink('server_' + date + '.html', 'coverage/server_latest.html', function() {
				done();
			});
		});
	});
	grunt.registerTask('client', 'Test and build the client.', ['test:client', 'build:client']);
	grunt.registerTask('server', 'Test and build the server.', ['test:server', 'build:server', 'printcoverage', 'linkcoverage']);
	grunt.registerTask('default', 'Test and build both client and server.', ['server', 'client']);
};
