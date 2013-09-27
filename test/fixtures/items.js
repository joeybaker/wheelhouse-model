'use strict';

var Backbone = require('backbone')
  , Model = require('./item.js')

module.exports = Backbone.Collection.extend({
  url: '/items'
  , model: Model
})
