'use strict';
var port = 9071

module.exports = function(grunt){
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
    , meta: {
      version: '<%= pkg.version %>'
      , banner: '/*! <%= pkg.name %> - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n'
    }
    , jshint: {
      all: [
        'Gruntfile.js'
        , 'index.js'
        , 'lib/**/*.js'
        , 'test/**/*.js'
      ]
      , options: {
        jshintrc: '.jshintrc'
      }
    }
    , bump: {
      patch: {
        options: {
          part: 'patch'
          , tabSize: 2
        }
        , src: [
          'package.json'
        ]
      }
      , minor: {
        options: {
          part: 'minor'
          , tabSize: 2
        }
        , src: '<%= bump.patch.src %>'
      }
      , major: {
        options: {
          part: 'major'
          , tabSize: 2
        }
        , src: '<%= bump.patch.src %>'
      }
    }
    , simplemocha: {
      options: {
        timeout: 2000
        , ignoreLeaks: true
        , ui: 'bdd'
      }
      , all: {
        src: ['test/**/*.js']
      }
    }
    , mocha: {
      client: {
        // src: ['test/client.html']
        options: {
          bail: false // don't bail so the db can be cleaned up
          , log: true
          , mocha: {
            ignoreLeaks: true
            , ui: 'bdd'
          }
          , urls: ['http://localhost:' + port]
          , reporter: 'List'
          , run: false
          , timeout: 5000
        }
      }
    }
    , shell: {
      gitTag: {
        command: 'git tag v<%= grunt.file.readJSON("package.json").version %>'
        , options: {
          stdout: true
          , failOnError: true
        }
      }
      , gitRequireCleanTree: {
        command: 'function require_clean_work_tree(){\n' +
          ' # Update the index\n' +
          '    git update-index -q --ignore-submodules --refresh\n' +
          '    err=0\n' +

          ' # Disallow unstaged changes in the working tree\n' +
          '    if ! git diff-files --quiet --ignore-submodules --\n' +
          '    then\n' +
          '        echo >&2 "cannot $1: you have unstaged changes."\n' +
          '        git diff-files --name-status -r --ignore-submodules -- >&2\n' +
          '        err=1\n' +
          '    fi\n' +

          ' # Disallow uncommitted changes in the index\n' +
          '    if ! git diff-index --cached --quiet HEAD --ignore-submodules --\n' +
          '    then\n' +
          '        echo >&2 "cannot $1: your index contains uncommitted changes."\n' +
          '        git diff-index --cached --name-status -r --ignore-submodules HEAD -- >&2\n' +
          '        err=1\n' +
          '    fi\n' +

          '    if [ $err = 1 ]\n' +
          '    then\n' +
          '        echo >&2 "Please commit or stash them."\n' +
          '        exit 1\n' +
          '    fi\n' +
          '} \n require_clean_work_tree'
        , options: {
          failOnError: true
        }
      }
      , gitCommitPackage: {
        command: 'git commit --amend -i package.json --reuse-message HEAD'
        , options: {
          stdout: true
          , failOnError: true
        }
      }
      , gitPush: {
        command: 'git push origin master --tags'
        , options: {
          stdout: true
          , failOnError: true
        }
      }
      , npmPublish: {
        command: 'npm publish'
        , options: {
          stdout: true
          , failOnError: true
        }
      }
      , npmTest: {
        command: 'npm test'
        , options: {
          stdout: true
          , failOnError: true
        }
      }
    }
  })

  // so much smarter than manually requiring
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('testServer', 'start test server', function(){
    var flatiron = require('flatiron')
      , app = flatiron.app
      , browserify = require('browserify')
      , debowerify = require('debowerify')
      , Resource = require('wheelhouse-resource')
      , couch = require('wheelhouse-couch')
      , Collection = require('./test/fixtures/items.js')
      , fs = require('fs')
      , data = [
          {value: 'add1'}
          , {value: 'add2'}
          , {value: 'add3'}
        ]
      , collection = new Collection({})
      , done = this.async()

    app.use(flatiron.plugins.http)
    app.use(flatiron.plugins.log)
    app.router.configure({
      strict: false
    })
    app.use(couch, {
      name: 'wheelhouse-model-test-client'
    })

    app.router.get('/js/main.js', function(){
      var bundle = browserify()
      bundle.require('lodash', {expose: 'underscore'})
      bundle.add('./test/fixtures/main.js')
      bundle.transform(debowerify)

      this.res.writeHead(200, {'Content-Type': 'application/javascript'})
      bundle.bundle().pipe(this.res)
    })

    app.router.get('/js/test.js', function(){
      this.res.writeHead(200, {'Content-Type': 'application/javascript'})
      fs.createReadStream('./test/client.js').pipe(this.res)
    })

    app.router.get('/js/chai.js', function(){
      this.res.writeHead(200, {'Content-Type': 'application/javascript'})
      fs.createReadStream('./node_modules/chai/chai.js').pipe(this.res)
    })

    app.router.get('/js/bridge.js', function(){
      this.res.writeHead(200, {'Content-Type': 'application/javascript'})
      fs.createReadStream('./node_modules/grunt-mocha/phantomjs/bridge.js').pipe(this.res)
    })

    app.router.get('/js/mocha.js', function(){
      this.res.writeHead(200, {'Content-Type': 'application/javascript'})
      fs.createReadStream('./node_modules/mocha/mocha.js').pipe(this.res)
    })

    app.router.get('/', function(){
      this.res.writeHead(200, {'Content-Type': 'text/html'})
      fs.createReadStream('./test/client.html').pipe(this.res)
    })

    if (this.args.indexOf('start') > -1) {
      app.start(port, function(){
        var complete = grunt.util._.after(data.length, done)

        new Resource(collection, {
          app: app
        })

        data.forEach(function(item){
          collection.create(item, {
            success: complete
          })
        })
      })
    }
    else {
      app.db.destroy(function(){
        app.server.close(done)
      })
    }
  })

  grunt.registerTask('test', ['testServer:start', 'mocha', 'testServer:stop'])
  grunt.registerTask('publish', ['shell:gitRequireCleanTree', 'jshint', 'shell:npmTest', 'bump:' + (grunt.option('bump') || 'patch'), 'shell:gitCommitPackage', 'shell:gitTag', 'shell:gitPush', 'shell:npmPublish'])
}
