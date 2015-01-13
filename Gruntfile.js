'use strict';

module.exports = function ( grunt ) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  /**
   * Load required Grunt tasks. These are installed based on the versions listed
   * in `package.json` when you do `npm install` in this directory.
   */
  require('load-grunt-tasks')(grunt);

  //grunt.loadNpmTasks('grunt-aws-s3');

  /**
   * Load in our build configuration file.
   */
  var userConfig = require( './build.config.js' );

  /**
   * This is the configuration object Grunt uses to give each plugin its
   * instructions.
   */
  var taskConfig = {
    /**
     * We read in our `package.json` file so we can access the package name and
     * version. It's already there, so we don't repeat ourselves here.
     */
    pkg: grunt.file.readJSON('package.json'),

    /**
     * The banner is the comment that is placed at the top of our compiled
     * source files. It is first processed as a Grunt template, where the `<%=`
     * pairs are evaluated based on this very configuration object.
     */
    meta: {
      banner:
        '/**\n' +
        ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * <%= pkg.product %> by\n' +
        ' * <%= pkg.organization %>\n' +
        ' * <%= pkg.homepage %>\n' +
        ' * Author: <%= pkg.author %>\n' +
        ' * Email: <%= pkg.authorEmail %>\n' +
        ' *\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        ' * Licensed <%= pkg.licenses.type %> <<%= pkg.licenses.url %>>\n' +
        ' */\n'
    },

    // The actual grunt server settings
    // Allowing CORS (Cross-Origin Resource Sharing) requests from
    // grunt server, add middleware...
    connect: {
      options: {
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35730
      },
      server: {
        options: {
          port: 9002,
          base: [
            '<%= build_dir %>'
          ],
          open: false
        }
      }
    },

    /**
     * Creates a changelog on a new version.
     */
    changelog: {
      options: {
        dest: 'CHANGELOG.md',
        template: 'changelog.tpl'
      }
    },

    /**
     * Increments the version number, etc.
     */
    bump: {
      options: {
        files: [
          'package.json',
          'bower.json'
        ],
        commit: false,
        commitMessage: 'chore(release): v%VERSION%',
        commitFiles: [
          'package.json',
          'bower.json'
        ],
        createTag: false,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'origin'
      }
    },

    aws: grunt.file.readJSON('/Users/brian/grunt-aws-homepage.json'),
    aws_s3: { // jshint ignore:line
      options: {
        accessKeyId: '<%= aws.key %>', // Use the variables
        secretAccessKey: '<%= aws.secret %>', // You can also use env variables
        uploadConcurrency: 5, // 5 simultaneous uploads
        downloadConcurrency: 5 // 5 simultaneous downloads
      },
      home: {
        options: {
          bucket: 'civicevolution.org',
          differential: true // Only uploads the files that have changed
        },
        files: [
          {expand: true, cwd: 'dist', src: ['**/*'], dest: ''},
          {cwd: 'dist', dest: '/', 'action': 'delete', differential: true}
        ]
      },
      test: {
        options: {
          bucket: 'civilevolution.com',
          differential: true // Only uploads the files that have changed
        },
        files: [
          {expand: true, cwd: 'dist', src: ['**/*'], dest: ''},
          {cwd: 'dist', dest: '/', 'action': 'delete', differential: true}
          //{expand: true, cwd: 'assets/prod/large', src: ['**'], dest: 'assets/large/', stream: true}, // enable stream to allow large files
          //{expand: true, cwd: 'assets/prod/', src: ['**'], dest: 'assets/', params: {CacheControl: '2000'}},
          // CacheControl only applied to the assets folder
          // I might want cache control on assets
          //headers: {
          //  // Two Year cache policy (1000 * 60 * 60 * 24 * 730)
          //  'Cache-Control': 'max-age=630720000, public',
          //    'Expires': new Date(Date.now() + 63072000000).toUTCString()
          //}
        ]
      }
    },

    /**
     * The directories to delete when `grunt clean` is executed.
     */
    clean: [
      '<%= build_dir %>',
      '<%= compile_dir %>'
    ],

    /**
     * The `copy` task just copies files from A to B. We use it here to copy
     * our project assets (images, fonts, etc.) and javascripts into
     * `build_dir`, and then to copy the assets to `compile_dir`.
     */
    copy: {
      buildAppAssets: {
        files: [
          {
            src: [ '**/*' ],
            dest: '<%= build_dir %>/images/',
            cwd: 'src/images',
            expand: true
          },
          {
            src: [ '**/*.css' ],
            dest: '<%= build_dir %>/assets/css/styles/',
            cwd: 'src/styles',
            expand: true
          },
          {
            src: [ '**/*' ],
            dest: '<%= build_dir %>/assets/css/styles/images/',
            cwd: 'src/styles/images',
            expand: true
          },
          {
            src: [ 'favicon.ico' ],
            dest: '<%= build_dir %>/',
            cwd: 'src',
            expand: true
          }
        ]
      },
      buildVendorAssets: {
        files: [
          {
            src: [ '<%= vendor_files.assets %>' ],
            dest: '<%= build_dir %>/assets/',
            cwd: '.',
            expand: true,
            flatten: true
          }
        ]
      },
      buildAppjs: {
        files: [
          {
            src: [ '<%= app_files.js %>' ],
            dest: '<%= build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      htmlFiles: {
        files: [
          {
            src: [ '<%= app_files.html_files %>' ],
            dest: '<%= build_dir %>/',
            cwd: 'src',
            expand: true
          }
        ]
      },
      buildVendorjs: {
        files: [
          {
            src: [ '<%= vendor_files.js %>' ],
            dest: '<%= build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },

      buildVendorcss: {
        files: [
          {
            src: ['<%= vendor_files.css %>'],
            dest: '<%= build_dir %>/assets/',
            cwd: '.',
            expand: true
          },
          {
            src: ['<%= vendor_dir %>/fontawesome/fonts/*'],
            dest: '<%= build_dir %>/assets/',
            cwd: '.',
            expand: true
          }
        ]
      },
      compileAssets: {
        files: [
          {
            expand: true,
            cwd: '<%= build_dir %>/images',
            src: [ '**/*' ],
            dest: '<%= compile_dir %>/images/'
          },
          //{
          //  src: [ '**/*.css' ],
          //  dest: '<%= compile_dir %>/assets/css/styles/',
          //  cwd: '<%= build_dir %>/assets/css/styles',
          //  expand: true
          //},
          {
            src: [ '**/*' ],
            dest: '<%= compile_dir %>/assets/images/',
            cwd: '<%= build_dir %>/assets/css/styles/images',
            expand: true
          },
          {
            src: [ 'favicon.ico' ],
            dest: '<%= compile_dir %>/',
            cwd: '<%= build_dir %>',
            expand: true
          }
        ]
      },
      compileVendorCss: {
        files: [
          {
            expand: true,
            cwd: '<%= build_dir %>/assets/vendor',
            src: [ '**' ],
            dest: '<%= compile_dir %>/assets/vendor'
          }
        ]
      },
      compileHtmlFiles: {
        files: [
          {
            src: [ '*.html', '!index.html' ],
            dest: '<%= compile_dir %>/',
            cwd: '<%= build_dir %>',
            expand: true
          }
        ]
      },
    },

    /**
     * `grunt concat` concatenates multiple source files into a single file.
     */
    concat: {
      /**
       * The `compile_dir` target is the concatenation of our application source code
       * into a single file. All files matching what's in the `src.js`
       * configuration property above will be included in the final build.
       *
       * In addition, the source is surrounded in the blocks specified in the
       * `module.prefix` and `module.suffix` files, which are just run blocks
       * to ensure nothing pollutes the global namespace.
       *
       * The `options` array allows us to specify some customization for this
       * operation. In this case, we are adding a banner to the top of the file,
       * based on the above definition of `meta.banner`. This is simply a
       * comment with copyright information.
       */
      buildCss: {
        src: [
          '<%= vendor_files.css %>',
          '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
        ],
        dest: '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css'
      },
      /**
       * The `compile_js` target is the concatenation of our application source
       * code and all specified vendor source code into a single file.
       */
      compileJs: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          '<%= vendor_files.js %>',
          'module.prefix',
          '<%= build_dir %>/src/**/*.js',
          '<%= html2js.app.dest %>',
          '<%= html2js.common.dest %>',
          'module.suffix'
        ],
        dest: '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.js'
      }
    },

    /**
     * `grunt coffee` compiles the CoffeeScript sources. To work well with the
     * rest of the build, we have a separate compilation task for sources and
     * specs so they can go to different places. For example, we need the
     * sources to live with the rest of the copied JavaScript so we can include
     * it in the final build, but we don't want to include our specs there.
     */
    coffee: {
      source: {
        options: {
          bare: true
        },
        expand: true,
        cwd: '.',
        src: [ '<%= app_files.coffee %>' ],
        dest: '<%= build_dir %>',
        ext: '.js'
      }
    },

    /**
     * `ngAnnotate` annotates the sources before minifying. That is, it allows us
     * to code without the array syntax.
     */
    ngAnnotate: {
      compile: {
        files: [
          {
            src: [ '<%= app_files.js %>' ],
            cwd: '<%= build_dir %>',
            dest: '<%= build_dir %>',
            expand: true
          },
          {
            src: [ '<%= app_files.annotate_vendor %>' ],
            cwd: '<%= vendor_dir %>',
            dest: '<%= vendor_dir %>',
            expand: true
          }
        ]
      }
    },

    ngdocs: {
    /**
       * Basic ngdocs configuration. Contains a temporary `site_tmp` folder which
       * gets later committed to gh-pages branch. The nav-template modifies the standard
       * ngdocs navigation template to add additional markup for example.
       *
       * html5Mode controls if pushState is active or not. We set this to `false` by default
       * to make sure the generated site works well on github pages without routing
       * problems.
       *
       * `styles` let you manipulate the basic styles that come with ngdocs, we made
       * the font-sizes in particular cases a bit smaller so that everything looks
       * nice.
       *
       * `api`, `guide` and `tutorial` configure the certain sections. You could either
       * declare some source files as `src` which contain ngdoc comments, or simply
       * *.ngdoc files which also get interpreted as ngdoc files.
       */
      options: {
        dest: 'site_tmp',
        title: grunt.file.readJSON('bower.json').name,
        navTemplate: 'docs/html/navigation.html',
        html5Mode: false,
        startPage: '/guide',
        styles: ['docs/css/styles.css']
      },

      /*
       * API section configuration. Defines source files and a section title.
       */
      api: {
        src: ['<%= app_files.js %>', 'docs/content/api/*.ngdoc'],
        title: 'API Reference'
      },

      /*
       * Guide section configuration. Defines source files and a section title.
       */
      guide: {
        src: ['docs/content/guide/*.ngdoc'],
        title: 'Guide'
      },
      /*
       * Tutorial section configuration. Defines source files and a section title.
       */
      tutorial: {
        src: ['docs/content/tutorial/*.ngdoc'],
        title: 'Tutorial'
      }
    },

    /**
     * Minify the sources!
     */
    uglify: {
      compile: {
        options: {
          banner: '<%= meta.banner %>',
          beautify: true,
          compression: false
        },
        files: {
          '<%= concat.compileJs.dest %>': '<%= concat.compileJs.dest %>'
        }
      }
    },

    haml: {                              // Task
      dist: {                            // Target
        files: [
          {
            expand: true,
            cwd: '.',
            src: [ '<%= app_files.haml %>' ],
            dest: '<%= build_dir %>',
            ext: '.html'
          },
          {
            expand: true,
            cwd: '.',
            src: [ '<%= app_files.haml_tpl %>' ],
            dest: '<%= build_dir %>',
            ext: '.tpl.html'
          }
        ]
      },
      dev: {                             // Another target
        options: {                       // Target options
          style: 'expanded'
        },
        files: [{
          expand: true,
          cwd: '.',
          src: [ '<%= app_files.haml %>' ],
          dest: '<%= build_dir %>',
          ext: '.html'
        }]
      }
    },


    /**
     * use grunt-contrib-compass for sass with compass compiling
     */
    compass: {
      build: {
        options: {
          sassDir: '<%= sass_dir %>',
          cssDir: '<%= build_dir %>/assets/css',
          imagesDir: 'assets/images',
          debugInfo: true,
          importPath: [ '<%= vendor_dir %>' ]
        }
      }
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 2 versions', '> 1%', 'ie 8', 'ie 7']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= build_dir %>/assets/css',
          src: '**/*.css',
          dest: '<%= build_dir %>/assets/css'
        }]
      }
    },

    /**
     * Exlicitly minify css code, since grunt-contrib-compass does not come with
     * built-in minification support. This task will be executed **after** scss
     * files have been compiled.
     * This is a minification and concatenation
     */
    cssmin: {
      compile: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          '<%= build_dir %>/**/*.css'
        ],
        dest: '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.min.css'
      }
    },

    /**
     * `jshint` defines the rules of our linter as well as which files we
     * should check. This file, all javascript sources, and all our unit tests
     * are linted based on the policies listed in `options`. But we can also
     * specify exclusionary patterns by prefixing them with an exclamation
     * point (!); this is useful when code comes from a third party but is
     * nonetheless inside `src/`.
     */
    jshint: {

      options: {
        jshintrc: '.jshintrc'
      },

      src: [
        '<%= app_files.js %>'
      ],
      test: [
        '<%= app_files.jsunit %>'
      ],
      gruntfile: [
        'Gruntfile.js'
      ]
    },

    /**
     * `coffeelint` does the same as `jshint`, but for CoffeeScript.
     * CoffeeScript is not the default in ngBoilerplate, so we're just using
     * the defaults here.
     */
    coffeelint: {
      src: {
        files: {
          src: [ '<%= app_files.coffee %>' ]
        }
      },
      test: {
        files: {
          src: [ '<%= app_files.coffeeunit %>' ]
        }
      }
    },

    /**
     * HTML2JS is a Grunt plugin that takes all of your template files and
     * places them into JavaScript files as strings that are added to
     * AngularJS's template cache. This means that the templates too become
     * part of the initial payload as one JavaScript file. Neat!
     */
    html2js: {
      /**
       * These are the templates from `src/app`.
       */
      app: {
        options: {
          base: 'build/src/app'
        },
        src: [ '<%= app_files.atpl %>', '<%= app_files.ahtml %>' ],
        dest: '<%= build_dir %>/templates-app.js'
      },

      /**
       * These are the templates from `src/common`.
       */
      common: {
        options: {
          base: 'src/common'
        },
        src: [ '<%= app_files.ctpl %>' ],
        dest: '<%= build_dir %>/templates-common.js'
      }
    },

    /**
     * The Karma configurations.
     */
    karma: {
      options: {
        configFile: '<%= build_dir %>/karma-unit.js'
      },
      unit: {
        port: 9019,
        background: true
      },
      continuous: {
        singleRun: true
      }
    },

    /**
     * The `index` task compiles the `index.html` file as a Grunt template. CSS
     * and JS files co-exist here but they get split apart later.
     */
    index: {

      /**
       * During development, we don't want to have wait for compilation,
       * concatenation, minification, etc. So to avoid these steps, we simply
       * add all script files directly to the `<head>` of `index.html`. The
       * `src` property contains the list of included files.
       */
      build: {
        dir: '<%= build_dir %>',
        src: [
          '<%= vendor_files.js %>',
          '<%= build_dir %>/src/**/*.js',
          '<%= html2js.common.dest %>',
          '<%= html2js.app.dest %>',
          '<%= vendor_files.css %>',
          '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css',
          '<%= compass.build.options.cssDir %>/**/*.css'
        ]
      },

      /**
       * When it is time to have a completely compiled application, we can
       * alter the above to include only a single JavaScript and a single CSS
       * file. Now we're back!
       */
      compile: {
        dir: '<%= compile_dir %>',
        src: [
          '<%= concat.compileJs.dest %>',
          '<%= vendor_files.css %>',
          '<%= cssmin.compile.dest %>'
          //'<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.min.css'
          //'<%= compile_dir %>/assets/css/main.css'
        ]
      }
    },

    /**
     * This task compiles the karma template so that changes to its file array
     * don't have to be managed manually.
     */
    karmaconfig: {
      unit: {
        dir: '<%= build_dir %>',
        src: [
          '<%= vendor_files.js %>',
          '<%= html2js.app.dest %>',
          '<%= html2js.common.dest %>',
          '<%= test_files.js %>'
        ]
      }
    },

    /**
     * And for rapid development, we have a watch set up that checks to see if
     * any of the files listed below change, and then to execute the listed
     * tasks when they do. This just saves us from having to type 'grunt' into
     * the command-line every time we want to see what we're working on; we can
     * instead just leave 'grunt watch' running in a background terminal. Set it
     * and forget it, as Ron Popeil used to tell us.
     *
     * But we don't need the same thing to happen for all the files.
     */
    delta: {
      /**
       * By default, we want the Live Reload to work for all tasks; this is
       * overridden in some tasks (like this file) where browser resources are
       * unaffected. It runs by default on port 35729, which your browser
       * plugin should auto-detect.
       */
      options: {
        livereload: 35730
      },

      /**
       * When the Gruntfile changes, we just want to lint it. In fact, when
       * your Gruntfile changes, it will automatically be reloaded!
       */
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: [ 'jshint:gruntfile' ],
        options: {
          livereload: false
        }
      },

      /**
       * When our JavaScript source files change, we want to run lint them and
       * run our unit tests.
       */
      jssrc: {
        files: [
          '<%= app_files.js %>'
        ],
        //tasks: [ 'jshint:src', 'karma:unit:run', 'copy:buildAppjs' ]
        tasks: [ 'jshint:src', 'copy:buildAppjs' ]
      },

      /**
       * When our CoffeeScript source files change, we want to run lint them and
       * run our unit tests.
       */
      coffeesrc: {
        files: [
          '<%= app_files.coffee %>'
        ],
        //tasks: [ 'coffeelint:src', 'coffee:source', 'karma:unit:run', 'copy:buildAppjs' ]
        tasks: [ 'newer:coffeelint:src', 'newer:coffee:source', 'copy:buildAppjs' ]
      },

      coffeeUpdateIndex: {
        files: [
          '<%= app_files.coffee %>'
        ],
        tasks: [ 'index:build' ],
        options: {
          event: ['added', 'deleted'],
          reload: true
        }
      },


      /**
       * When SCSS files changes, we need to compile them to css
       */
      sass: {
        files: [
          '<%= app_files.scss %>'
        ],
        tasks: ['compass', 'autoprefixer']
      },

      sassUpdateIndex: {
        files: [
          '<%= app_files.scss %>'
        ],
        tasks: [ 'index:build' ],
        options: {
          event: ['added', 'deleted'],
          reload: true
        }
      },


      ///**
      // * When assets are changed, copy them. Note that this will *not* copy new
      // * files, so this is probably not very useful.
      // */
      assets: {
        files: [
          'src/assets/**/*'
        ],
        tasks: [ 'copy:buildAppAssets', 'copy:buildVendorAssets' ]
      },

      /**
       * When *.haml changes, we need to compile it.
       */

      haml: {
        files: [
          '<%= app_files.haml %>'
        ],
        tasks: ['newer:haml']
      },

      hamlTpl: {
        files: [
          '<%= app_files.haml_tpl %>'
        ],
        tasks: ['newer:haml']
      },

      hamlTplUpdate: {
        files: [
          '<%= app_files.haml_tpl %>'
        ],
        tasks: [ ],
        options: {
          event: ['added', 'deleted'],
          reload: true
        }
      },
      /**
       * When index.html changes, we need to compile it.
       */
      html: {
        files: [ '<%= app_files.html %>' ],
        tasks: [ 'index:build' ]
      },

      /**
       * When html templates, like angular UI change
       */
      //html: {
      //  files: [ '<%= app_files.templates %>' ],
      //  tasks: [ 'copy:templates', 'html2js' ]
      //},

      /**
       * When our templates change, we only rewrite the template cache.
       */
      tpls: {
        files: [
          '<%= app_files.atpl %>',
          '<%= app_files.ctpl %>'
        ],
        tasks: [ 'html2js' ]
      },

      /**
       * When a JavaScript unit test file changes, we only want to lint it and
       * run the unit tests. We don't want to do any live reloading.
       */
      jsunit: {
        files: [
          '<%= app_files.jsunit %>'
        ],
        tasks: [ 'jshint:test', 'karma:unit:run' ],
        options: {
          livereload: false
        }
      },

      /**
       * When a CoffeeScript unit test file changes, we only want to lint it and
       * run the unit tests. We don't want to do any live reloading.
       */
      coffeeunit: {
        files: [
          '<%= app_files.coffeeunit %>'
        ],
        tasks: [ 'coffeelint:test', 'karma:unit:run' ],
        options: {
          livereload: false
        }
      }
    }
  };

  grunt.initConfig( grunt.util._.extend( taskConfig, userConfig ) );

  /**
   * In order to make it safe to just compile or copy *only* what was changed,
   * we need to ensure we are starting from a clean, fresh build. So we rename
   * the `watch` task to `delta` (that's why the configuration var above is
   * `delta`) and then add a new task called `watch` that does a clean build
   * before watching for changes.
   */
  grunt.renameTask( 'watch', 'delta' );
  //grunt.registerTask( 'watch', [ 'build', 'karma:unit', 'delta' ] );
  grunt.registerTask( 'watch', [ 'build', 'connect', 'delta' ] );

  /**
   * The default task is to build and compile.
   */
  grunt.registerTask( 'default', [ 'build', 'compile' ] );

  /**
   * The `build` task gets your app ready to run for development and testing.
   */
  grunt.registerTask( 'build', [
    'clean',
    'jshint',
    'coffeelint',
    'coffee',
    'haml',
    'copy:htmlFiles',
    'compass:build',
    'autoprefixer',
    'copy:buildAppAssets',
    'copy:buildVendorAssets',
    'copy:buildVendorcss',
    'copy:buildAppjs',
    'copy:buildVendorjs',
    'index:build'//,
    //'karmaconfig',
    //'karma:continuous'
  ]);

  /**
   * The `compile` task gets your app ready for deployment by concatenating and
   * minifying your code.
   */
  grunt.registerTask( 'compile', [
    'cssmin:compile',
    'copy:compileAssets',
    'copy:compileVendorCss',
    'concat:compileJs',
    'uglify',
    'index:compile',
    'copy:compileHtmlFiles'
  ]);

  grunt.registerTask( 'deploy', [
    'aws_s3:home'
  ]);


  /**
   * A utility function to get all app JavaScript sources.
   */
  function filterForJS ( files ) {
    return files.filter( function ( file ) {
      return file.match( /\.js$/ );
    });
  }

  /**
   * A utility function to get all app CSS sources.
   */
  function filterForCSS ( files ) {
    return files.filter( function ( file ) {
      return file.match( /\.css$/ );
    });
  }

  /**
   * The index.html template includes the stylesheet and javascript sources
   * based on dynamic names calculated in this Gruntfile. This task assembles
   * the list into variables for the template to use and then runs the
   * compilation.
   */
  grunt.registerMultiTask( 'index', 'Process index.html template', function () {
    var dirRE = new RegExp( '^('+grunt.config('build_dir')+'|'+grunt.config('compile_dir')+')\/', 'g' );
    var jsFiles = filterForJS( this.filesSrc ).map( function ( file ) {
      return file.replace( dirRE, '' );
    });
    var cssFiles = filterForCSS( this.filesSrc ).map( function ( file ) {
      if(file.match(/vendor\//)) {
        file = 'assets/' + file;
      }
      return file.replace( dirRE, '' );
    });

    grunt.file.copy('src/index.html', this.data.dir + '/index.html', {
      //process: function ( contents, path ) {
      process: function ( contents ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles,
            version: grunt.config( 'pkg.version' )
          }
        });
      }
    });
  });

  /**
   * In order to avoid having to specify manually the files needed for karma to
   * run, we use grunt to manage the list for us. The `karma/*` files are
   * compiled as grunt templates for use by Karma. Yay!
   */
  grunt.registerMultiTask( 'karmaconfig', 'Process karma config templates', function () {
    var jsFiles = filterForJS( this.filesSrc );

    grunt.file.copy( 'karma/karma-unit.tpl.js', grunt.config( 'build_dir' ) + '/karma-unit.js', {
      //process: function ( contents, path ) {
      process: function ( contents ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles
          }
        });
      }
    });
  });

};
