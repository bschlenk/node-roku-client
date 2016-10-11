const Test = require('tape')
const Nodeku = require('../')
const Mocks = require('./mocks')

function wrapper(description, fn) {
  Test(description, t => {
    Nodeku(null, Mocks.Client)
    .then(device => {
      fn(t, device);
    })
    .catch(t.fail)
  })
}

Test('Nodeku initialization', t => {
  t.ok(typeof Nodeku === 'function', 'is ready')
  t.end()
})

wrapper('Nodeku Discovery', (t, device) => {
  t.timeoutAfter(2000)

  t.assert(typeof device === 'object', 'module received')
  t.assert(device.ip() === '192.168.1.17:8060', 'device has an ip address')

  t.end()
})

wrapper('Nodeku Device Methods', (t, device) => {

})