import { EventEmitter } from 'node:events'

import _debug from 'debug'
import SSDP from 'node-ssdp'

const { Client: SSDPClient } = SSDP

const debug = _debug('roku-client:discover')

const DEFAULT_TIMEOUT = 10000

/**
 * Discover one Roku device on the network. Resolves to the first Roku device
 * that responds to the ssdp request.
 * @param timeout The time to wait in ms before giving up.
 * @return A promise resolving to a Roku device's address.
 */
export function discover(timeout: number = DEFAULT_TIMEOUT): Promise<URL> {
  return new Promise<URL>((resolve, reject) => {
    const finder = new RokuFinder()
    const startTime = Date.now()

    function elapsedTime() {
      return Date.now() - startTime
    }

    finder.on('found', (address) => {
      finder.stop()
      resolve(new URL(address))
      debug(`found Roku device at ${address} after ${elapsedTime()}ms`)
    })

    finder.on('timeout', () => {
      reject(new Error(`Could not find any Roku devices after ${timeout} ms`))
    })

    finder.start(timeout)
  })
}

/**
 * Discover all Roku devices on the network. This method always waits the full
 * timeout, resolving to a list of all Roku device addresses that responded
 * within `timeout` ms.
 * @param timeout The time to wait in ms before giving up.
 * @return A promise resolving to a list of Roku device addresses.
 */
export function discoverAll(timeout: number = DEFAULT_TIMEOUT): Promise<URL[]> {
  return new Promise((resolve, reject) => {
    const finder = new RokuFinder()
    const addresses = new Set<string>()
    const startTime = Date.now()

    function elapsedTime() {
      return Date.now() - startTime
    }

    finder.on('found', (address) => {
      if (addresses.has(address)) return
      debug(`found Roku device at ${address} after ${elapsedTime()}ms`)
      addresses.add(address)
    })

    finder.on('timeout', () => {
      if (addresses.size > 0) {
        debug('found Roku devices at %o after %dms', addresses, elapsedTime())
        resolve(Array.from(addresses).map((address) => new URL(address)))
      } else {
        reject(new Error(`Could not find any Roku devices after ${timeout} ms`))
      }
    })

    finder.start(timeout)
  })
}

/**
 * Discover Roku devices on the network as they are found. This method invokes
 * the callback for each device found, allowing you to process devices as they
 * are discovered rather than waiting for the full timeout.
 * @param callback Called for each device found, receives the device address.
 * @param timeout The time to wait in ms before giving up.
 * @return A promise that resolves when the timeout completes.
 */
export function discoverEach(
  callback: (address: URL) => void,
  timeout: number = DEFAULT_TIMEOUT,
): Promise<void> {
  return new Promise((resolve) => {
    const finder = new RokuFinder()
    const addresses = new Set<string>()
    const startTime = Date.now()

    function elapsedTime() {
      return Date.now() - startTime
    }

    finder.on('found', (address) => {
      if (addresses.has(address)) return
      debug(`found Roku device at ${address} after ${elapsedTime()}ms`)
      addresses.add(address)
      callback(new URL(address))
    })

    finder.on('timeout', () => {
      const time = elapsedTime()
      const count = addresses.size
      debug(`discovery completed after ${time}ms, found ${count} devices`)
      resolve()
    })

    finder.start(timeout)
  })
}

/**
 * Helper class abstracting the lifecycle of locating Roku devices on the
 * network.
 */
class RokuFinder extends EventEmitter<{ found: [string]; timeout: [] }> {
  private readonly client = new SSDPClient()
  private intervalId: NodeJS.Timeout | null = null
  private timeoutId: NodeJS.Timeout | null = null

  constructor() {
    super()

    this.client.on('response', (headers) => {
      if (!this.intervalId) return

      const { SERVER, LOCATION } = headers
      if (SERVER && LOCATION && SERVER.includes('Roku')) {
        const address = parseAddress(LOCATION)
        this.emit('found', address)
      }
    })
  }

  start(timeout: number) {
    // make sure start doesn't trigger multiple intervals
    this.stop()

    debug('beginning search for roku devices')

    const search = () => {
      this.client.search('roku:ecp')
    }

    const done = () => {
      this.stop()
      this.emit('timeout')
    }

    this.intervalId = setInterval(search, 1000)
    this.timeoutId = setTimeout(done, timeout)
    search()
  }

  stop() {
    if (!this.intervalId) return

    clearInterval(this.intervalId)
    clearTimeout(this.timeoutId!)
    this.intervalId = null
    this.timeoutId = null
    this.client.stop()
  }
}

function parseAddress(location: string): string {
  const url = new URL(location)
  url.pathname = ''
  return url.toString()
}
