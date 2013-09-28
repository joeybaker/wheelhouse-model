'use strict';

var model = require('./mutual.js')

module.exports = model.extend({
  // we know we're on the client because browserify will look at the package.json
  _isClient: true
  , _isServer: false
})
