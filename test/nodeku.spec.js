const Test = require('tape')
const Nodeku = require('../')
const Mocks = require('./mocks')

Test('Nodeku initialization', t => {
  t.ok(typeof Nodeku === 'function', 'is ready')
  t.end()
})

Test('Nodeku Discovery', t => {
  t.timeoutAfter(12000)

  Nodeku(null, Mocks.Client)
    .then(device => {
      t.assert(typeof device === 'object', 'module received')
      t.assert(device.ip() === '192.168.1.17:8060', 'device has an ip address')
      t.end()
    })
    .catch(t.fail)
})
