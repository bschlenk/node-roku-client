
const Test = require('ava')
const assert = require('assert')
const Im = require('immutable')

/* mocks and fixtures */
const Mocks = require('./mocks')
const ReqMockConfig = require('./superagent-mock-config')
const Req = require('superagent')
var logger = function(log)  {
  console.log('superagent call', log);
};

const MockReqTearDown = require('superagent-mock')(Req, ReqMockConfig/*, logger*/)

/* main star */
let Nodeku = require('../')

Nodeku = Nodeku.bind({
  MockSSDPClient: Mocks.Client,
  // MockReq: Req,
});

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
      t.truthy(objectsHaveCorrectProps, 'maps has correct props')
    })
})

// wrapper('-method: .activeApp()', (t, device) => {
//   return device
//     .activeApp()
//     .then(app => {
//       t.true(Im.List.isList(app), 'returns list')

//       let objectsHaveCorrectProps = isDeepEqual(app, ['id', 'name', 'type', 'version'])
//       t.truthy(objectsHaveCorrectProps, 'maps has correct props')
//     })
// })

// wrapper('-method: .info()', (t, device) => {
//   return device
//     .info()
//     .then(info => {
//       t.true(Im.Map.isMap(info), 'returns a map')
//       t.is(Object.keys(info.toJS()).length, 29, 'has 29 props')

//       // TODO - doesn't deep equal?!
//       let props = [
//         'user-device-name',
//         'headphones-connected',
//         'serial-number',
//         'advertising-id',
//         'notifications-first-use',
//         'software-build',
//         'power-mode',
//         'secure-device',
//         'time-zone',
//         'keyed-developer-id',
//         'model-number',
//         'model-name',
//         'vendor-name',
//         'software-version',
//         'device-id',
//         'supports-suspend',
//         'time-zone-offset',
//         'country',
//         'voice-search-enabled',
//         'wifi-mac',
//         'model-region',
//         'language',
//         'ethernet-mac',
//         'network-type',
//         'locale',
//         'search-enabled',
//         'notifications-enabled',
//         'developer-enabled',
//         'udn'
//       ]

//       let mapHasCorrectProps = isDeepEqual([info], props)
//       t.truthy(mapHasCorrectProps, 'maps has correct props')
//     })
// })

// wrapper('-method: .keypress(\'Info\')', (t, device) => {
//   return device
//     .keypress('Info')
//     .then(ok => {
//       t.true(ok, 'Info successful')
//     })
// })

// wrapper('-method: .keypress(\'Home\')', (t, device) => {
//   return device
//     .keypress('Home')
//     .then(ok => {
//       t.true(ok, 'Home successful')
//     })
// })

function isDeepEqual(apps, legend) {
  return apps.every(app => {
    return !assert.deepEqual(Object.keys(app.toJS()), legend)
  })
}
