
'use strict';

const nodeSSDPClient = require('node-ssdp').Client;
const device = require('./device');

module.exports = function (timeout) {
  const self = this || {};

  timeout = timeout || self._timeout || 10000;

  return new Promise((resolve, reject) => {
    const client = new nodeSSDPClient();

    // Open the flood gates
    const intervalId = setInterval(() => {
      client.search('ssdp:all');
    }, 1000);

    // Discovery timeout for roku device; default 10000ms
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);

      return reject(new Error(`Could not find any Roku devices. Time spent: ${timeout / 1000} seconds`));
    }, timeout);

    client.on('response', headers => {
      if (self.debug) {
        return;
      }

      // Roku devices operate on PORT 8060
      const ipAddress = /(\d+.*:8060)(?=\/)/.exec(headers.LOCATION);

      if ('SERVER' in headers && Boolean(~headers.SERVER.search(/Roku/)) && ipAddress) {
        clearInterval(intervalId);
        clearTimeout(timeoutId);

        return resolve(device(ipAddress[0]));
      }
    });
  });
};
