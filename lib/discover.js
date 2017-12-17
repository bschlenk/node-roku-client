import url from 'url';
import { Client as SSDPClient } from 'node-ssdp';
import _debug from 'debug';

const debug = _debug('roku-client:discover');

const DEFAULT_TIMEOUT = 10000;

function parseAddress(location) {
  const parts = url.parse(location);
  parts.path = null;
  parts.pathname = null;
  return url.format(parts);
}

/**
 * Discover the Roku devices on the network. Setting `wait` to false (default)
 * makes this return the first Roku device that it finds. Setting `wait` to true
 * makes `discover` wait for the entire `timeout`, returning a list of all devices'
 * addresses that responded within `timeout` ms.
 * @param {number=} timeout The time to wait in ms before giving up.
 * @param {boolean=} wait Whether to wait for all devices to respond.
 * @return {Promise<string|string[]>} A promise resolving to a Roku device's address,
 *     or a list of addresses if wait was set to true.
 */
export default function discover(timeout = DEFAULT_TIMEOUT, wait = false) {
  return new Promise((resolve, reject) => {
    const client = new SSDPClient();
    const addresses = [];
    const startTime = Date.now();
    let resolved = false;
    let intervalId;
    let timeoutId;

    function done() {
      resolved = true;
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      client.stop();
    }

    function elapsedTime() {
      return Date.now() - startTime;
    }

    client.on('response', (headers) => {
      const { SERVER, LOCATION } = headers;
      if (!resolved && SERVER && LOCATION && SERVER.includes('Roku')) {
        const address = parseAddress(LOCATION);
        if (!wait) {
          done();
          resolve(address);
          debug(`found Roku device at ${address} after ${elapsedTime()}ms`);
        } else if (!addresses.includes(address)) {
          addresses.push(address);
        }
      }
    });

    timeoutId = setTimeout(() => {
      done();
      if (wait && addresses.length > 0) {
        debug('found Roku devices at %o after %dms', addresses, elapsedTime());
        resolve(addresses);
      } else {
        reject(new Error(`Could not find any Roku devices after ${
          timeout / 1000} seconds`));
      }
    }, timeout);

    function start() {
      client.search('roku:ecp');
      debug('beginning search for roku devices');
    }

    intervalId = setInterval(start, 1000);
    start();
  });
}
