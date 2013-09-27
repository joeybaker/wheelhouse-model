'use strict';

var Backbone = require('backbone')
  , _ = require('lodash')

module.exports = Backbone.Model.extend({
  // assume we're using couchdb
  idAttribute: '_id'
  // assume this is the client if there are no env vars
  , _isClient: !Object.keys(process.env).length
  // , sync: function(method, model, options){
  //   var dfd
  //   if (typeof options === 'object' && (options.only === 'client' && !this._isClient) || (options.only === 'server' && this._isClient)) {

  //     dfd = Backbone.$ ? new Backbone.$.Deferred() : void 0

  //     setTimeout(function(){
  //       var res = options.wait
  //         ? 'Sent to server, client not set'
  //         : 'Sent to server, set on client'

  //       if (typeof options === 'object' && options.success) options.success(model, res, options)
  //       dfd.resolve()
  //     }, 0)

  //     return dfd.promise()
  //   }

  //   return Backbone.Model.prototype.sync.call(this, method, model, options)
  // }
  , save: function(key, val, options) {
    var attrs, dfd

    // Handle both `"key", value` and `{key: value}` -style arguments.
    // we need to copy this bit over from Backbone.Model.save so that we can parse out options
    if (key == null || typeof key === 'object') {
      attrs = key
      options = val
    } else {
      (attrs = {})[key] = val
    }

    if (options.only && (options.only === 'client' && !this._isClient) || (options.only === 'server' && this._isClient)) {

      // bail if validation fails
      if (!this.set(attrs, options)) return false


      // call success if defined
      if (options.success){
        // defer to simulate an ajax request and ensure success happens in the correct place in the event loop
        _.defer(options.success, this, 'set only', options)
      }

      dfd = Backbone.$ ? new Backbone.$.Deferred() : void 0
      if (dfd) {
        _.defer(dfd.resolve)
        return dfd.promise()
      }
      else return
    }

    return Backbone.Model.prototype.save.apply(this, arguments)
  },
})
