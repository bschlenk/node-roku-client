
const NodeSSDPClient = require('node-ssdp').Client;
const Device = require('./device');

module.exports = function (timeout) {
  timeout = timeout || this._timeout || 10000;

  return new Promise((resolve, reject) => {
    let RokuUrl;
    let Client;

    // check for mock ssdpclient, use if available
    if (this.hasOwnProperty('MockSSDPClient')) {
      Client = new this.MockSSDPClient();
    } else {
      Client = new NodeSSDPClient();
    }

    // open the flood gates
    const IntervalId = setInterval(_ => {
      Client.search('ssdp:all');
    }, 1000);

    // discovery timeout for roku device; default 10000ms
    const TimeoutId = setTimeout(_ => {
      clearInterval(IntervalId);
      clearTimeout(TimeoutId);

      return reject(new Error(`Could not find any Roku devices. Time spent: ${timeout / 1000} seconds`));
    }, timeout);

    Client.on('response', headers => {
      if (this.debug) {
        return;
      }
      // roku devices operate on PORT 8060
      let ipAddress = /(\d+.*:8060)(?=\/)/.exec(headers.LOCATION);

      if (Boolean(~headers.SERVER.search(/Roku/)) && ipAddress) {
        RokuUrl = ipAddress[0];

        clearInterval(IntervalId);
        clearTimeout(TimeoutId);

        return resolve(Device(RokuUrl, this.MockReq));
      }
    });
  });
};
