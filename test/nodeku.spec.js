const Test = require('tape')
const Nodeku = require('../')

// TODO Stub ssdp client w/ Roku credentials
// const NodeSSDPServer = require('node-ssdp').Server
// const Server = new NodeSSDPServer();

Test('Nodeku exists', t => {
  t.assert(typeof Nodeku === 'function', 'is a Function.')
})