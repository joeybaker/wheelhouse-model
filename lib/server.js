'use strict';

var model = require('./mutual.js')

module.exports = model.extend({
  // we know we're on the server because browserify will look at the package.json
  _isClient: false
  , _isServer: true
})
