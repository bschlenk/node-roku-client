
'use strict';

const test = require('ava');
const Req = require('superagent');

/* mocks and fixtures */
/* main star */
let Nodeku = require('../');
const SsdpMock = require('./resources/ssdp-mock');
const ReqMockConfig = require('./resources/superagent-error-config');

require('superagent-mock')(Req, ReqMockConfig/* , Utils.logger */);

let timeoutVal = 5000;
Nodeku = Nodeku.bind({
  MockSSDPClient: SsdpMock.Client.bind(true),
  MockReq: Req,
  debug: true,
  _timeout: timeoutVal
});

test('throws when device is not found (timeout: 2s)', t => {
  t.throws(
    Nodeku(),
    `Could not find any Roku devices. Time spent: ${timeoutVal / 1000} seconds`,
    'throws a timeout error'
  );
});
