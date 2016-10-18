
const Test = require('ava')

const SsdpMock = require('./resources/ssdp-mock')
let Discovery = require('../lib/discovery')

Discovery = Discovery.bind({
  MockSSDPClient: SsdpMock.Client
})

Test.serial('discovery exists and returns a Promise', t => {
  t.true(Discovery instanceof Function, 'is a Function')
  t.true(Discovery() instanceof Promise, 'returns a Promise')
})

Test.serial('discovery returns device module when a Roku device is found', t => {
  return Discovery()
    .then(device => {
      t.is(typeof device, 'object', 'is a module')
    })
    .catch(err => t.fail(err))
})