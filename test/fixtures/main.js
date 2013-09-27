'use strict';

var $ = require('jquery')
  , Backbone = require('backbone')
  , Collection = require('./items.js')

Backbone.$ = $

window.collection = new Collection()
window._ = require('lodash')
