import * as url from 'url';
import { Client as SSDPClient, Headers } from 'node-ssdp';
import _debug = require('debug');

const debug = _debug('roku-client:discover');

const DEFAULT_TIMEOUT = 10000;

function parseAddress(location: string): string {
  const parts = url.parse(location);
  parts.path = undefined;
  parts.pathname = undefined;
  return url.format(parts);
}

// TODO: deprecate the wait param and add a new discoverAll method
/**
 * Discover the Roku devices on the network. Setting `wait` to false (default)
 * makes this return the first Roku device that it finds. Setting `wait` to true
 * makes `discover` wait for the entire `timeout`, returning a list of all devices'
 * addresses that responded within `timeout` ms.
 * @param timeout The time to wait in ms before giving up.
 * @param wait Whether to wait for all devices to respond.
 * @return A promise resolving to a Roku device's address,
 *     or a list of addresses if wait was set to true.
 */
export default function discover(timeout?: number): Promise<string>;
export default function discover(timeout: number, wait: false): Promise<string>;
export default function discover(timeout: number, wait: true): Promise<string[]>;
export default function discover(
  timeout: number = DEFAULT_TIMEOUT,
  wait: boolean = false,
): Promise<string|string[]> {
  return new Promise((resolve, reject) => {
    const client = new SSDPClient();
    const addresses: string[] = [];
    const startTime = Date.now();
    let resolved = false;
    let intervalId: NodeJS.Timer;
    let timeoutId: NodeJS.Timer;

    function done() {
      resolved = true;
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      client.stop();
    }

    function elapsedTime() {
      return Date.now() - startTime;
    }

    client.on('response', (headers: Headers) => {
      const { SERVER, LOCATION } = headers;
      if (!resolved && SERVER && LOCATION && SERVER.includes('Roku')) {
        const address = parseAddress(LOCATION);
        if (!wait) {
          done();
          resolve(address);
          debug(`found Roku device at ${address} after ${elapsedTime()}ms`);
        } else if (addresses.indexOf(address) !== -1) {
          debug(`found Roku device at ${address} after ${elapsedTime()}ms`);
          addresses.push(address);
        }
      }
    });

    timeoutId = setTimeout(
      () => {
        done();
        if (wait && addresses.length > 0) {
          debug('found Roku devices at %o after %dms', addresses, elapsedTime());
          resolve(addresses);
        } else {
          reject(new Error(`Could not find any Roku devices after ${
            timeout / 1000} seconds`));
        }
      },
      timeout,
    );

    function start() {
      client.search('roku:ecp');
      debug('beginning search for roku devices');
    }

    intervalId = setInterval(start, 1000);
    start();
  });
}
