
const NodeSSDPClient = require('node-ssdp').Client
const Client = new NodeSSDPClient();

class RokuDevice {
  constructor(url) {
    this.url = url;
  }
}

module.exports = function(timeout) {

  timeout = timeout || 10000

  return new Promise(function(resolve, reject){

    let RokuUrl;

    Client.on('response', function inResponse(headers, code, rinfo) {
      let ipAddress = /(\d+.*:8060)(?=\/)/.exec(headers.LOCATION);

      if (!!~headers.SERVER.search(/Roku/) && ipAddress) {
        RokuUrl = ipAddress[0]

        clearInterval(IntervalId)
        clearTimeout(TimeoutId)

        return resolve(new RokuDevice(RokuUrl))
      }
    })

    const IntervalId = setInterval(_ => {
      Client.search('ssdp:all')
    }, 1000)

    const TimeoutId = setTimeout(_ => {

      clearInterval(IntervalId)
      clearTimeout(TimeoutId)

      return reject(new Error(`Could not find any Roku devices. Time spent: ${timeout / 1000} seconds`))
    }, timeout)
  })
}
