
'use strict';

/* eslint
  import/order: "off",
 */

const test = require('ava');
const proxyquire = require('proxyquire');
const ssdpMock = require('./helpers/ssdp-mock');

const discovery = proxyquire('../lib/discovery', {
  'node-ssdp': ssdpMock
});

test.serial('discovery exists and returns a Promise', t => {
  t.true(discovery instanceof Function, 'is a Function');
});

test.serial('discovery returns device module when a Roku device is found', async t => {
  const device = await discovery();

  t.is(typeof device, 'object', 'is a module');
});
