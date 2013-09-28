'use strict';

var Backbone = require('backbone')
  , _ = require('lodash')

module.exports = Backbone.Model.extend({
  // assume we're using couchdb
  idAttribute: '_id'
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
