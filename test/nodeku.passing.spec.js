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

wrapper('methods: .apps()', (t, device) => {
  t.plan(5)

  t.truthy(device.hasOwnProperty('apps'), 'exists')
  t.is(typeof device.apps, 'function' , 'is a function')

  return device
    .apps()
    .then(apps => {
      t.truthy(Array.isArray(apps), 'returns an array')

      let containsOnlyObjects = apps.every(app => typeof app === 'object')
      t.truthy(containsOnlyObjects, 'array items are objects')

      let objectsHaveCorrectProps = apps.every(app => {
        let result = true;

        return !assert.deepEqual(Object.keys(app), ['name', 'id', 'appl', 'version'])
      })
      t.truthy(objectsHaveCorrectProps, 'objects has proper keys')
    })
})


