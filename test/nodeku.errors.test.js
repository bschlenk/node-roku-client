
const Test = require('ava')
const assert = require('assert')
const Im = require('immutable')
const Utils = require('./resources/utils')

/* mocks and fixtures */
const SsdpMock = require('./resources/ssdp-mock')
const ReqMockConfig = require('./resources/superagent-error-config')
const Req = require('superagent')

const MockReqTearDown = require('superagent-mock')(Req, ReqMockConfig/*, Utils.logger*/)

/* main star */
let Nodeku = require('../')

Nodeku = Nodeku.bind({
  MockSSDPClient: SsdpMock.Client.bind(true),
  MockReq: Req,
  debug: true,
  _timeout: 1000
})

Test('throws when device is not found (timeout: 2s)', t => {
  t.throws(
    Nodeku(),
    /Could not find any Roku devices. Time spent: 1 seconds/,
    'throws a timeout error'
  )
})



