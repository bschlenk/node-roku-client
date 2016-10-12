
const NodeSSDPClient = require('node-ssdp').Client
const Device = require('./lib/device')

module.exports = function nodeku(timeout) {
  timeout = timeout || 10000

  return new Promise((resolve, reject) => {

    let RokuUrl

    // MockSSDPClient is used for testing at the moment.
    let Client = new this.MockSSDPClient() || new NodeSSDPClient()

    const IntervalId = setInterval(_ => {
      Client.search('ssdp:all')
    }, 1000)

    const TimeoutId = setTimeout(_ => {

      clearInterval(IntervalId)
      clearTimeout(TimeoutId)

      return reject(new Error(`Could not find any Roku devices. Time spent: ${timeout / 1000} seconds`))
    }, timeout)

    Client.on('response', function inResponse(headers/*, code, rinfo*/) {
      let ipAddress = /(\d+.*:8060)(?=\/)/.exec(headers.LOCATION)

      if (!!~headers.SERVER.search(/Roku/) && ipAddress) {
        RokuUrl = ipAddress[0]

        clearInterval(IntervalId)
        clearTimeout(TimeoutId)

        return resolve(Device(RokuUrl))
      }
    })

  })
}
