
const Test = require('ava')
const assert = require('assert')
const Im = require('immutable')
const Utils = require('./resources/utils')

/* mocks and fixtures */
const SsdpMock = require('./resources/ssdp-mock')
const ReqMockConfig = require('./resources/superagent-mock-config')
const Req = require('superagent')

const MockReqTearDown = require('superagent-mock')(Req, ReqMockConfig, Utils.logger)

/* main star */
let Nodeku = require('../')

Nodeku = Nodeku.bind({
  MockSSDPClient: SsdpMock.Client,
  MockReq: Req,
});

function isDeepEqual(apps, legend) {
  return apps.every(app => {
    return !assert.deepEqual(Object.keys(app.toJS()), legend)
  })
}

function wrapper(description, fn) {
  Test(description, t => {
    return Nodeku()
      .then(device => {
        return fn(t, device)
      })
  })
}

Test('Nodeku', t => {
  t.is(typeof Nodeku, 'function', 'is ready')
})

wrapper('-method: .ip()', (t, device) => {
  t.true(device.hasOwnProperty('ip'), 'exists')
  t.is(typeof device.ip, 'function' , 'is a function')
  t.deepEqual(device.ip(), '192.168.1.17:8060', 'ip address retreived')
})

wrapper('-method: .apps()', (t, device) => {

  t.true(device.hasOwnProperty('apps'), 'exists')
  t.is(typeof device.apps, 'function' , 'is a function')

  return device
    .apps()
    .then(apps => {
      t.true(Im.List.isList(apps), 'returns a list')

      let containsOnlyObjects = apps.every(app => Im.Map.isMap(app))
      t.true(containsOnlyObjects, 'list contains maps')

      let objectsHaveCorrectProps = isDeepEqual(apps, ['id', 'name', 'type', 'version'])
      t.true(objectsHaveCorrectProps, 'maps has correct props')
    })
})


wrapper('-method: .active()', (t, device) => {
  return device
    .active()
    .then(app => {
      t.true(Im.List.isList(app), 'returns list')

      let objectsHaveCorrectProps = isDeepEqual(app, ['id', 'name', 'type', 'version'])
      t.true(objectsHaveCorrectProps, 'maps has correct props')
    })
})

wrapper('-method: .info()', (t, device) => {
  return device
    .info()
    .then(info => {
      t.true(Im.Map.isMap(info), 'returns a map')
      t.is(Object.keys(info.toJS()).length, 29, 'has 29 props')
    })
})

wrapper('-method: .keypress(\'Home\')', (t, device) => {
  return device
    .keypress('Home')
    .then(ok => {
      t.true(ok, 'Home successful')
    })
})

wrapper('-method: .keydown(\'Home\')', (t, device) => {
  return device
    .keydown('Home')
    .then(ok => {
      t.true(ok, 'Home successful')
    })
})

wrapper('-method: .keyup(\'Home\')', (t, device) => {
  return device
    .keyup('Home')
    .then(ok => {
      t.true(ok, 'Home successful')
    })
})

wrapper('-method: .icon()', (t, device) => {
  return device
    .icon('12')
    .then(img => {
      t.true(img instanceof Buffer)
    })
})

wrapper('-method: .launch()', (t, device) => {
  return device
    .apps()
    .then(apps => {
      let randomIndex = Math.floor(Math.random() * apps.size)
      let appToLaunch = apps.toJS().splice(randomIndex, 1)[0]
      return device.launch(appToLaunch.id)
    })
    .then(res => {
      t.true(res)
    })
})
