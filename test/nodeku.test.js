
'use strict';

const assert = require('assert');
const test = require('ava');
const im = require('immutable');
const req = require('superagent');
let Nodeku = require('../');
const utils = require('./helpers/utils');

/* Mocks and fixtures */
const ssdpMock = require('./helpers/ssdp-mock');
const ReqMockConfig = require('./helpers/superagent-mock-config');

require('superagent-mock')(req, ReqMockConfig, utils.logger);

Nodeku = Nodeku.bind({
  MockSSDPClient: ssdpMock.Client,
  MockReq: req
});

function isDeepEqual(apps, legend) {
  return apps.every(app => {
    return !assert.deepEqual(Object.keys(app.toJS()), legend);
  });
}

function wrapper(description) {
  test(description, async t => {
    const device = await Nodeku();
    t.truthy(device);
  });
}

test('Nodeku', t => {
  t.is(typeof Nodeku, 'function', 'is ready');
});

wrapper('-method: .ip()', (t, device) => {
  t.true(device.hasOwnProperty('ip'), 'exists');
  t.is(typeof device.ip, 'function', 'is a function');
  t.deepEqual(device.ip(), '192.168.1.17:8060', 'ip address retreived');
});

wrapper('-method: .apps()', (t, device) => {
  t.true(device.hasOwnProperty('apps'), 'exists');
  t.is(typeof device.apps, 'function', 'is a function');

  return device
    .apps()
    .then(apps => {
      t.true(im.List.isList(apps), 'returns a list');

      const containsOnlyObjects = apps.every(app => im.Map.isMap(app));
      t.true(containsOnlyObjects, 'list contains maps');

      const objectsHaveCorrectProps = isDeepEqual(apps, ['id', 'name', 'type', 'version']);
      t.true(objectsHaveCorrectProps, 'maps has correct props');
    });
});

wrapper('-method: .active()', (t, device) => {
  return device
    .active()
    .then(app => {
      t.true(im.List.isList(app), 'returns list');

      const objectsHaveCorrectProps = isDeepEqual(app, ['id', 'name', 'type', 'version']);
      t.true(objectsHaveCorrectProps, 'maps has correct props');
    });
});

wrapper('-method: .info()', (t, device) => {
  return device
    .info()
    .then(info => {
      t.true(im.Map.isMap(info), 'returns a map');
      t.is(Object.keys(info.toJS()).length, 29, 'has 29 props');
    });
});

wrapper('-method: .keypress(\'Home\')', (t, device) => {
  return device
    .keypress('Home')
    .then(res => t.truthy(res));
});

wrapper('-method: .icon()', (t, device) => {
  return device
    .icon('12')
    .then(img => {
      t.true(img instanceof Buffer);
    });
});

wrapper('-method: .launch()', (t, device) => {
  return device
    .apps()
    .then(apps => {
      const randomIndex = Math.floor(Math.random() * apps.size);
      const appToLaunch = apps.toJS().splice(randomIndex, 1)[0];
      return device.launch(appToLaunch.id);
    })
    .then(t.done);
});
