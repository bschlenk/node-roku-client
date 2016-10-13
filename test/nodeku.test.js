
const Test = require('ava')
const assert = require('assert')
const Im = require('immutable')
const Utils = require('./resources/utils')

/* mocks and fixtures */
const SsdpMock = require('./resources/ssdp-mock')
const ReqMockConfig = require('./resources/superagent-mock-config')
const Req = require('superagent')

const MockReqTearDown = require('superagent-mock')(Req, ReqMockConfig/*, Utils.logger*/)

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
  t.truthy(typeof Nodeku === 'function', 'is ready')
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


wrapper('-method: .activeApp()', (t, device) => {
  return device
    .activeApp()
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

      // TODO - doesn't deep equal?!
      let props = [
        'user-device-name',
        'headphones-connected',
        'serial-number',
        'advertising-id',
        'notifications-first-use',
        'software-build',
        'power-mode',
        'secure-device',
        'time-zone',
        'keyed-developer-id',
        'model-number',
        'model-name',
        'vendor-name',
        'software-version',
        'device-id',
        'supports-suspend',
        'time-zone-offset',
        'country',
        'voice-search-enabled',
        'wifi-mac',
        'model-region',
        'language',
        'ethernet-mac',
        'network-type',
        'locale',
        'search-enabled',
        'notifications-enabled',
        'developer-enabled',
        'udn'
      ]

      let mapHasCorrectProps = isDeepEqual([info], props)
      t.true(mapHasCorrectProps, 'maps has correct props')
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
