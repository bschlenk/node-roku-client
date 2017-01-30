
'use strict';

const nodeSSDPClient = require('node-ssdp').Client;
const device = require('./device');

module.exports = function (timeout) {
  timeout = timeout || this._timeout || 10000;

  return new Promise((resolve, reject) => {
    let client;

    // check for mock ssdpclient, use if available
    if (this.hasOwnProperty('MockSSDPClient')) {
      client = new this.MockSSDPClient();
    } else {
      client = new nodeSSDPClient();
    }

    // open the flood gates
    const intervalId = setInterval(() => {
      client.search('ssdp:all');
    }, 1000);

    // discovery timeout for roku device; default 10000ms
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);

      return reject(new Error(`Could not find any Roku devices. Time spent: ${timeout / 1000} seconds`));
    }, timeout);

    client.on('response', headers => {
      if (this.debug) {
        return;
      }

      // roku devices operate on PORT 8060
      const ipAddress = /(\d+.*:8060)(?=\/)/.exec(headers.LOCATION);

      if (Boolean(~headers.SERVER.search(/Roku/)) && ipAddress) {
        clearInterval(intervalId);
        clearTimeout(timeoutId);

        return resolve(device(ipAddress[0], this.MockReq));
      }
    });
  });
};
