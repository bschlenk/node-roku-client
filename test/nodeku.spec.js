const Test = require('tape')
const Nodeku = require('../')
const Mocks = require('./mocks')

Test('Nodeku initialization', t => {
  t.ok(typeof Nodeku === 'function', 'is ready.')
  t.end()
})

Test('Nodeku Discovery', t => {
  t.plan(1)

  Nodeku(null, Mocks.Client)
    .then(deviceAddr => {
      t.assert(deviceAddr === '192.168.1.17:8060')
    })
    .catch(t.fail)
})