const Test = require('ava')
let Nodeku = require('../')
const Mocks = require('./mocks')
const assert = require('assert')

Nodeku = Nodeku.bind({ MockSSDPClient: Mocks.Client });

function wrapper(description, fn) {
  Test(description, t => {
    return Nodeku()
      .then(device => {
        return fn(t, device)
      })
  })
}

Test('initialization', t => {
  t.truthy(typeof Nodeku === 'function', 'is ready')
})

wrapper('methods: .ip()', (t, device) => {
  t.truthy(device.hasOwnProperty('ip'), 'exists')
  t.is(typeof device.ip, 'function' , 'is a function')
  t.deepEqual(device.ip(), '192.168.1.17:8060', 'ip address retreived')
})

wrapper('discovery', (t, device) => {
  t.timeoutAfter(2000)
  t.plan(2)

  t.assert(typeof device === 'object', 'module received')
  t.assert(device.ip() === '192.168.1.17:8060', 'ip address located')

})

wrapper('apps', (t, device) => {



  t.end();
})