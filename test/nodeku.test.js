
'use strict';

const assert = require('assert');
const test = require('ava');
const req = require('superagent');
const proxyquire = require('proxyquire');
const utils = require('./helpers/utils');

/* Mocks and fixtures */
const ssdpMock = require('./helpers/ssdp-mock');
const ReqMockConfig = require('./helpers/superagent-mock-config');

require('superagent-mock')(req, ReqMockConfig, utils.logger);

const device = proxyquire('../lib/device', {
  got: req
});
const Nodeku = proxyquire('../lib/discovery', {
  'node-ssdp': ssdpMock,
  './device': device
});

function isDeepEqual(apps, legend) {
  return apps.every(app => {
    return !assert.deepEqual(Object.keys(app), legend);
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
      t.true(Array.isArray(apps), 'returns a list');

      const containsOnlyObjects = apps.every(app => app === Object(app));
      t.true(containsOnlyObjects, 'list contains maps');

      const objectsHaveCorrectProps = isDeepEqual(apps, ['id', 'name', 'type', 'version']);
      t.true(objectsHaveCorrectProps, 'maps has correct props');
    });
});

wrapper('-method: .active()', (t, device) => {
  return device
    .active()
    .then(app => {
      t.true(Array.isArray(app), 'returns list');

      const objectsHaveCorrectProps = isDeepEqual(app, ['id', 'name', 'type', 'version']);
      t.true(objectsHaveCorrectProps, 'maps has correct props');
    });
});

wrapper('-method: .activeApp()', (t, device) => {
  return device
    .activeApp()
    .then(app => {
      t.true(Array.isArray(app), 'returns list');

      const objectHasCorrectProps = !assert.deepEqual(
        Object.keys(app), ['id', 'name', 'type', 'version']);
      t.true(objectHasCorrectProps, 'map has correct props');
    });
});

wrapper('-method: .info()', (t, device) => {
  return device
    .info()
    .then(info => {
      t.true(info === Object(info), 'returns a map');
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
