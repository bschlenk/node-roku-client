
'use strict';

/* eslint
  import/order: "off",
 */

const test = require('ava');

const ssdpMock = require('./resources/ssdp-mock');
const discovery = require('../lib/discovery').bind({
  MockSSDPClient: ssdpMock.Client
});

test.serial('discovery exists and returns a Promise', t => {
  t.true(discovery instanceof Function, 'is a Function');
});

test.serial('discovery returns device module when a Roku device is found', async t => {
  const device = await discovery();

  t.is(typeof device, 'object', 'is a module');
});
