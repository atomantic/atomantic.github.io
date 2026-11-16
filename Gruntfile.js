module.exports = function (grunt) {
  "use strict";
  grunt.initConfig({
    clean: {
      // clean:release removes generated files
      dist: ["dist"],
    },
    appcache: {
      options: {
        basePath: "dist",
      },
      all: {
        dest: "dist/adam.appcache",
        cache: {
          patterns: [
            "dist/**/*",
            "!dist/pub/**/*",
            "!dist/slides/**/*",
            "!dist/bin/**/*",
            "!dist/CNAME",
            "!dist/pinterest-8184f.html",
            "!dist/main.appcache",
            "!dist/**/.DS_Store",
            "!dist/lib/font/league_gothic_license",
            "!dist/lib/js/head.min.js",
          ],
          literals: "/", // insert '/' as is in the "CACHE:" section
        },
        network: "*",
      },
    },
    watch: {
      livereload: {
        options: {
          livereload: true,
        },
        files: [
          "index.html",
          "slides/list.json",
          "slides/*.md",
          "slides/*.html",
          "templates/**",
          "js/*.js",
          "img/**",
          "css/*.css",
        ],
      },
      index: {
        files: [
          "templates/_index.html",
          "templates/_section.html",
          "slides/list.json",
        ],
        tasks: ["buildIndex"],
      },
      sass: {
        files: ["css/source/theme.scss"],
        tasks: ["sass"],
      },
    },
    sass: {
      theme: {
        files: {
          "css/theme.css": "css/source/theme.scss",
        },
      },
    },
    connect: {
      livereload: {
        options: {
          port: 9000,
          hostname: "localhost",
          base: ".",
          open: true,
          livereload: true,
        },
      },
    },
    copy: {
      dist: {
        files: [
          {
            expand: true,
            src: [
              ".well-known/**",
              "_config.yml",
              "CNAME",
              "slides/**",
              "js/**",
              "bin/**",
              "img/**",
              "lib/**",
              "pub/**",
              "css/*.css",
              "*.png",
              "keybase.txt",
              "beetledeck.html",
            ],
            dest: "dist/",
          },
          {
            expand: true,
            src: ["index.html"],
            dest: "dist/",
            filter: "isFile",
          },
          {
            expand: true,
            src: ["pinterest-8184f.html"],
            dest: "dist/",
            filter: "isFile",
          },
        ],
      },
    },
    filerev: {
      options: {
        encoding: "utf8",
        algorithm: "md5",
        length: 20,
      },
      release: {
        // filerev:release hashes(md5) all assets (images, js and css )
        // in dist directory
        files: [
          {
            src: ["dist/img/**/*.{png,jpg}", "dist/js/*.js", "dist/css/*.css"],
          },
        ],
      },
    },
    buildcontrol: {
      options: {
        dir: "dist",
        commit: true,
        push: true,
        message: "Built from %sourceCommit% on branch %sourceBranch%",
      },
      pages: {
        options: {
          remote: "git@github.com:atomantic/atomantic.github.io.git",
          branch: "public",
        },
      },
    },
    useminPrepare: {
      html: "dist/index.html",
    },
    usemin: {
      html: "dist/index.html",
    },
  });
  require("load-grunt-tasks")(grunt);

  grunt.registerTask(
    "buildIndex",
    "Build index.html from templates/_index.html and slides/list.json.",
    function () {
      var html, indexTemplate, sectionTemplate, slides;
      indexTemplate = grunt.file.read("templates/_index.html");
      sectionTemplate = grunt.file.read("templates/_section.html");
      slides = grunt.file.readJSON("slides/list.json");
      html = grunt.template.process(indexTemplate, {
        data: {
          slides: slides,
          section: function (slide, sectionIndex, subsectionIndex) {
            var file, slideHTML;
            slideHTML = "";
            if (typeof slide === "string") {
              file = "slides/" + slide;
            } else if (slide.filename) {
              file = "slides/" + slide.filename;
            }
            if (file) {
              slideHTML = grunt.file.read(file);
            }
            return grunt.template.process(sectionTemplate, {
              data: {
                slide: slide,
                sectionIndex: sectionIndex,
                subsectionIndex: subsectionIndex,
                html: slideHTML,
              },
            });
          },
        },
      });
      return grunt.file.write("index.html", html);
    }
  );

  grunt.registerTask("dist", "Save files to *dist* directory.", [
    "clean",
    "sass",
    "buildIndex",
    "copy",
    "useminPrepare",
    "concat",
    "cssmin",
    "uglify",
    "filerev",
    "usemin",
  ]);
  grunt.registerTask("deploy", "Deploy to Github Pages", [
    "dist",
    "appcache",
    "buildcontrol",
  ]);
  grunt.registerTask(
    "server",
    "Run locally and start watch process (living document).",
    ["buildIndex", "sass", "connect:livereload", "watch"]
  );
  grunt.registerTask("default", ["server"]);

  grunt.registerTask("cache", ["appcache"]);
};
