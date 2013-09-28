wheelhouse-model
=======================

[![NPM](https://nodei.co/npm/wheelhouse-model.png)](https://nodei.co/npm/wheelhouse-model/)

Using Backbone client-side and server-side is pretty sweet, you get the same, event-driven approach to data management on the server that's been so good on the client. But, there's a problem: when you're using the same models/collections in both environments, triggering a `model.save` from an event happens on both client an server, meaning that the server commits a change to the database, and the client tries to commit the same change at nearly the same instant. Conflicts! Oh Nos!

Wheelhouse-model solves this by adding an `only` option to the `save` method allowing the user to specify which environment the call will be triggered in.

## Install
`npm i --save wheelhouse-model`

## Usage

### Requirements
* browserify
* lodash instead of the default underscore backbone dependency

### Example

```js
// model.js
var wheelhouseModel = require('wheelhouse-model')

module.exports = wheelhouseModel.extend({
  // your model config
  idAttribute: '_id' // overrides backbone's default 'id' to '_id' since wheelhouse only has a couchdb adapter right now.
})


// view.js
…
this.model.save({attribute: 'new value'}, {
   only: 'client' // possible values are 'client' || 'server'
})
…

```

## API
All methods are the same as backbone defaults unless specified.

### `idAttribute`
Overrides Backbone's default `'id'` to `'_id'`

### `save(attributes [, options])`

The options object now takes an additional argument: `only`

#### `only: 'client|server'`
If on the server, and `only` is set to `'client'`, the model will `set` the values, and trigger all necessary validation and events, but will not attempt to sync on the server. Visa versa on the client.

## Tests
You must have [grunt-cli](https://github.com/gruntjs/grunt-cli) installed: `sudo npm i -g grunt-cli`
`grunt test`

_A note about tests. This is a really hard problem to test because a good test is something of a unit/integration test that spans server and client code. The tests are currently incomplete and don't really work._

