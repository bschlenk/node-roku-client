const Test = require('ava')
let Nodeku = require('../')
const Mocks = require('./mocks')
const assert = require('assert')

const Im = require('immutable')

Nodeku = Nodeku.bind({ MockSSDPClient: Mocks.Client });

function wrapper(description, fn) {
  Test(description, t => {
    return Nodeku()
      .then(device => {
        return fn(t, device)
      })
  })
}

Test('Nodeku', t => {
  t.truthy(typeof Nodeku === 'function', 'is ready')
})

wrapper('-method: .ip()', (t, device) => {
  t.truthy(device.hasOwnProperty('ip'), 'exists')
  t.is(typeof device.ip, 'function' , 'is a function')
  t.deepEqual(device.ip(), '192.168.1.17:8060', 'ip address retreived')
})

wrapper('-method: .apps()', (t, device) => {
  t.plan(5)

  t.truthy(device.hasOwnProperty('apps'), 'exists')
  t.is(typeof device.apps, 'function' , 'is a function')

  return device
    .apps()
    .then(apps => {
      t.true(Im.List.isList(apps), 'returns a list')

      let containsOnlyObjects = apps.every(app => Im.Map.isMap(app))
      t.truthy(containsOnlyObjects, 'list contains maps')

      let objectsHaveCorrectProps = isDeepEqual(apps, ['id', 'name', 'type', 'version'])
      t.truthy(objectsHaveCorrectProps, 'maps has correct keys')
    })
})

wrapper('-method: .activeApp()', (t, device) => {
  return device
    .activeApp()
    .then(app => {
      t.true(Im.List.isList(app), 'returns list')

      let objectsHaveCorrectProps = isDeepEqual(app, ['id', 'name', 'type', 'version'])
      t.truthy(objectsHaveCorrectProps, 'maps has correct keys')
    })
})

function isDeepEqual(apps, legend) {
  return apps.every(app => {
    return !assert.deepEqual(Object.keys(app.toJS()), legend)
  })
}
