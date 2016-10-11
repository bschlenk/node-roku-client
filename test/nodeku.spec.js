const Test = require('tape')
const Nodeku = require('../')
const Mocks = require('./mocks')

Test('Nodeku initialization', t => {
  t.ok(typeof Nodeku === 'function', 'is ready')
  t.end()
})

Test('Nodeku Discovery and Device object', t => {
  t.plan(2)

  Nodeku(null, Mocks.Client)
    .then(device => {
      t.assert(device.constructor.name === 'Device', 'device returned is an instance of Device.')
      t.assert(device.ip === '192.168.1.17:8060', 'device has an ip address.')
    })
    .catch(t.fail)
})