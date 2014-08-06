module.exports = function(grunt) {
  grunt.initConfig({
    watch: {
      livereload: {
        options: {
          livereload: true
        },
        files: [
	        'index.html', 
	        'slides/list.json', 
	        'slides/*.md', 
	        'slides/*.html', 
	        'templates/**', 
	        'js/*.js', 
	        'img/**', 
	        'css/*.css'
        ]
      },
      index: {
        files: [
        	'templates/_index.html', 
        	'templates/_section.html', 
        	'slides/list.json'
        ],
        tasks: ['buildIndex']
      },
      jshint: {
        files: [
        	'Gruntfile.js',
        	'js/*.js'
        ],
        tasks: ['jshint']
      },
      sass: {
        files: ['css/source/theme.scss'],
        tasks: ['sass']
      }
    },
    sass: {
      theme: {
        files: {
          'css/theme.css': 'css/source/theme.scss'
        }
      }
    },
    connect: {
      livereload: {
        options: {
          port: 9000,
          hostname: 'localhost',
          base: '.',
          open: true,
          livereload: true
        }
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['js/*.js']
    },
    copy: {
      dist: {
        files: [
          {
            expand: true,
            src: [
            	'slides/**', 
            	'bower_components/**', 
            	'js/**', 
            	'img/**', 
            	'lib/**', 
            	'css/*.css', 
            	'*.png'
            ],
            dest: 'dist/'
          }, {
            expand: true,
            src: ['index.html'],
            dest: 'dist/',
            filter: 'isFile'
          }
        ]
      }
    },
    buildcontrol: {
      options: {
        dir: 'dist',
        commit: true,
        push: true,
        message: 'Built from %sourceCommit% on branch %sourceBranch%'
      },
      pages: {
        options: {
          remote: 'git@github.com:atomantic/atomantic.github.io.git',
          branch: 'master'
        }
      }
    }
  });
  require('load-grunt-tasks')(grunt);
  grunt.registerTask('buildIndex', 'Build index.html from templates/_index.html and slides/list.json.', function() {
    var html, indexTemplate, sectionTemplate, slides;
    indexTemplate = grunt.file.read('templates/_index.html');
    sectionTemplate = grunt.file.read('templates/_section.html');
    slides = grunt.file.readJSON('slides/list.json');
    html = grunt.template.process(indexTemplate, {
      data: {
        slides: slides,
        section: function(slide, sectionIndex, subsectionIndex) {
          var file, slideHTML;
          slideHTML = '';
          if (typeof slide === 'string') {
            file = 'slides/' + slide;
          } else if (slide.filename) {
            file = 'slides/' + slide.filename;
          }
          if (file) {
            slideHTML = grunt.file.read(file);
          }
          return grunt.template.process(sectionTemplate, {
            data: {
              slide: slide,
              sectionIndex: sectionIndex,
              subsectionIndex: subsectionIndex,
              html: slideHTML
            }
          });
        }
      }
    });
    return grunt.file.write('index.html', html);
  });
  grunt.registerTask('test', '*Lint* js files.', ['jshint']);
  grunt.registerTask('server', 'Run locally and start watch process (living document).', ['buildIndex', 'sass', 'connect:livereload', 'watch']);
  grunt.registerTask('dist', 'Save files to *dist* directory.', ['test', 'sass', 'buildIndex', 'copy']);
  grunt.registerTask('deploy', 'Deploy to Github Pages', ['dist', 'buildcontrol']);
  grunt.registerTask('default', ['test', 'server']);
};
