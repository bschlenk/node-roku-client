
const Test = require('ava')

const SsdpMock = require('../../test/resources/ssdp-mock')
let Discovery = require('../discovery')

Discovery = Discovery.bind({
  MockSSDPClient: SsdpMock.Client
})

Test('discovery exists and returns a Promise', t => {
  t.true(Discovery instanceof Function, 'is a Function')
  t.true(Discovery() instanceof Promise, 'returns a Promise')
})

Test('discovery returns device module when a Roku device is found', t => {
  return Discovery()
    .then(device => {
      t.is(typeof device, 'object', 'is a module')
    })
    .catch(err => t.fail(err))
})