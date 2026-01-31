import { EventEmitter } from 'node:events'
import * as url from 'node:url'

import _debug from 'debug'
import SSDP from 'node-ssdp'

const { Client: SSDPClient } = SSDP

const debug = _debug('roku-client:discover')

const DEFAULT_TIMEOUT = 10000

function parseAddress(location: string): string {
  const parts = url.parse(location)
  parts.path = null
  parts.pathname = null
  return url.format(parts)
}

/**
 * Helper class abstracting the lifecycle of locating Roku devices on the
 * network.
 */
class RokuFinder extends EventEmitter<{ found: [string]; timeout: [] }> {
  private readonly client = new SSDPClient()
  private intervalId!: number
  private timeoutId!: number
  private running = false

  constructor() {
    super()

    this.client.on('response', (headers) => {
      if (!this.running) return

      const { SERVER, LOCATION } = headers
      if (SERVER && LOCATION && SERVER.includes('Roku')) {
        const address = parseAddress(LOCATION)
        this.emit('found', address)
      }
    })
  }

  start(timeout: number) {
    debug('beginning search for roku devices')

    this.running = true

    const search = () => {
      this.client.search('roku:ecp')
    }

    const done = () => {
      this.stop()
      this.emit('timeout')
    }

    search()
    this.intervalId = setInterval(search, 1000) as unknown as number
    this.timeoutId = setTimeout(done, timeout) as unknown as number
  }

  stop() {
    clearInterval(this.intervalId)
    clearTimeout(this.timeoutId)
    this.running = false
    this.client.stop()
  }
}

/**
 * Discover one Roku device on the network. Resolves to the first Roku device
 * that responds to the ssdp request.
 * @param timeout The time to wait in ms before giving up.
 * @return A promise resolving to a Roku device's address.
 */
export function discover(timeout: number = DEFAULT_TIMEOUT): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const finder = new RokuFinder()
    const startTime = Date.now()

    function elapsedTime() {
      return Date.now() - startTime
    }

    finder.on('found', (address) => {
      finder.stop()
      resolve(address)
      debug(`found Roku device at ${address} after ${elapsedTime()}ms`)
    })

    finder.on('timeout', () => {
      reject(
        new Error(
          `Could not find any Roku devices after ${timeout / 1000} seconds`,
        ),
      )
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
export function discoverAll(
  timeout: number = DEFAULT_TIMEOUT,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const finder = new RokuFinder()
    const addresses: string[] = []
    const startTime = Date.now()

    function elapsedTime() {
      return Date.now() - startTime
    }

    finder.on('found', (address) => {
      if (!addresses.includes(address)) {
        debug(`found Roku device at ${address} after ${elapsedTime()}ms`)
        addresses.push(address)
      }
    })

    finder.on('timeout', () => {
      if (addresses.length > 0) {
        debug('found Roku devices at %o after %dms', addresses, elapsedTime())
        resolve(addresses)
      } else {
        reject(
          new Error(
            `Could not find any Roku devices after ${timeout / 1000} seconds`,
          ),
        )
      }
    })

    finder.start(timeout)
  })
}
