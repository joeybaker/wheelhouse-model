/* global describe, it, before, after */
'use strict';

var chai = require('chai')
  , expect = chai.expect
  , _ = require('lodash')

describe('wheelhouse-model', function(){
  var flatiron = require('flatiron')
    , app = flatiron.app
    , port = 9071
    , Resource = require('wheelhouse-resource')
    , couch = require('wheelhouse-couch')
    , Collection = require('./fixtures/items.js')
    , data = [
        {value: 'add'}
        , {value: 'add'}
        , {value: 'add'}
      ]
    , collection = new Collection({})
    , url = 'http://localhost:' + port + '/'

  before(function(done){
    app.use(flatiron.plugins.http)
    app.use(flatiron.plugins.log)
    app.router.configure({
      strict: false
    })
    app.use(couch, {
      name: 'wheelhouse-model-test'
    })

    app.start(port, function(){
      var complete = _.after(data.length, function(){
        done()
      })

      new Resource(collection, {
        app: app
      })

      data.forEach(function(item){
        collection.create(item, {
          success: complete
        })
      })
    })
  })

  it('determines it is in the server environment', function(){
    expect(collection.first()._isClient).to.be.false
  })

  it('is not in the client environment')

  it('only saves on the server if `only` is set to "server"', function(done){
    var value = 'changed!'
    collection.first().save({value: value}, {
      only: 'server'
      , success: function(){
        expect(collection.first().get('value')).to.equal(value)
        done()
      }
    })
  })

  after(function(done){
    app.server.close()
    app.db.destroy(done)
  })
})
