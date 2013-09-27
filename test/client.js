/* global describe, it, expect, before, _ */
'use strict';
var collection = window.collection

describe('wheelhouse-model', function(){
  before(function(done){
    collection.fetch({
      success: function(){
        done()
      }
    })
  })

  it('determines it is in the client environment', function(){
    expect(collection.first()._isClient).to.be.true
  })

  it('options.only saves on the client if `only` is set to "client"', function(done){
    var model = collection.findWhere({value: 'add1'})
      , value = model.get('value')
      , value2 = 'changed'
      , xhr

    xhr = model.save({value2: value2}, {
      only: 'client'
      , success: function(m, res){
        expect(model.get('value2')).to.equal(value2)
        expect(model.get('value')).to.equal(value)
        // we'll have a jquery response object
        expect(res).to.be.an.object

        model.fetch({
          success: function(){
            expect(model.get('value2')).to.equal(value2)
            expect(model.get('value')).to.equal(value)
            done()
          }
        })
      }
    })

    // save should always return a jquery promise
    expect(xhr.resolve).to.be.a.function
  })


  it('options.only sets on the client if `only` is set to "server"', function(done){
    var model = collection.findWhere({value: 'add2'})
      , value = model.get('value')
      , value2 = 'changed2'
      , xhr

    xhr = model.save({value2: value2}, {
      only: 'server'
      , success: function(m, res){
        expect(model.get('value2')).to.equal(value2)
        expect(model.get('value')).to.equal(value)
        // we're overrideing the typical jquery response object
        expect(res).to.be.a.string

        // the data should have persisted on the server
        model.fetch({
          success: function(){
            expect(model.get('value2')).to.equal(value2)
            expect(model.get('value')).to.equal(value)
            done()
          }
        })
      }
    })

    // save should always return a jquery promise
    expect(xhr.resolve).to.be.a.function
  })

  it('avoids a double save conflict', function(done){
    var model = collection.findWhere({value: 'add3'})
      , value = model.get('value')
      , value2a = 'changed2'
      , value2b = 'no conflict'
      , xhr
      , complete = _.after(2, done)

    model.on('change', function(){
      model.save({value2: value2b}, {
        wait: true
        , success: function(m, res){
          expect(m.get('value2')).to.equal(value2b)
          expect(m.get('value')).to.equal(value)
          expect(res).to.be.an.object
          complete()
        }
      })
    })

    xhr = model.save({value2: value2a}, {
      only: 'server'
      , success: function(m, res){
        expect(model.get('value2')).to.equal(value2a)
        expect(model.get('value')).to.equal(value)
        // we're overrideing the typical jquery response object
        expect(res).to.be.a.string

        // the data should have persisted on the server
        model.fetch({
          success: function(){
            expect(model.get('value2')).to.equal(value2a)
            expect(model.get('value')).to.equal(value)
            complete()
          }
        })
      }
    })

    // save should always return a jquery promise
    expect(xhr.resolve).to.be.a.function

  })

})
