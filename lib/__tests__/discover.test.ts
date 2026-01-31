import { __setHeaders } from 'node-ssdp'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { discover, discoverAll } from '../discover.js'

declare module 'node-ssdp' {
  function __setHeaders(headers: Headers | Headers[] | null): void
}

const HEADERS = {
  'CACHE-CONTROL': 'max-age=3600',
  ST: 'urn:dial-multiscreen-org:service:dial:1',
  USN: 'uuid:00000000-0000-0000-0000-000000000000::urn:dial-multiscreen-org:service:dial:1',
  EXT: '',
  SERVER: 'Roku UPnP/1.0 MiniUPnPd/1.4',
  LOCATION: 'http://192.168.1.17:8060/dial/dd.xml',
}

describe('discover', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('discover', () => {
    it('should resolve to the first roku ip address found', async () => {
      __setHeaders(HEADERS)

      const p = discover()
      // Don't advance timers - the mock should fire immediately
      const address = await p
      expect(address).toEqual('http://192.168.1.17:8060')
    })

    it('should fail after the configured timeout', () => {
      __setHeaders(null)

      const p = discover(1000)
      vi.advanceTimersByTime(1000)

      return expect(p).rejects.toThrow()
    })

    it('should not find devices that are not roku', async () => {
      __setHeaders([
        {
          SERVER: 'Some other thing',
          LOCATION: 'http://192.168.1.17:8060',
        },
        {
          SERVER: 'Yet another service',
          LOCATION: 'http://192.168.1.18:8060',
        },
        {
          SERVER: 'Roku',
          LOCATION: 'http://192.168.1.19:8060',
        },
      ])

      const p = discover(1000)
      // Array responses use setTimeout, need to advance timers to reach the Roku device at index 2
      vi.advanceTimersByTime(20)

      const address = await p
      expect(address).toEqual('http://192.168.1.19:8060')
    })
  })

  describe('discoverAll', () => {
    it('should find all devices', async () => {
      __setHeaders([
        {
          SERVER: 'Roku',
          LOCATION: 'http://192.168.1.17:8060',
        },
        {
          SERVER: 'Roku',
          LOCATION: 'http://192.168.1.18:8060',
        },
        {
          SERVER: 'Roku',
          LOCATION: 'http://192.168.1.19:8060',
        },
      ])

      const p = discoverAll(1000)
      vi.advanceTimersByTime(1000)

      const addresses = await p
      expect(addresses).toEqual([
        'http://192.168.1.17:8060',
        'http://192.168.1.18:8060',
        'http://192.168.1.19:8060',
      ])
    })

    it('should not include duplicate addresses', async () => {
      __setHeaders([
        {
          SERVER: 'Roku',
          LOCATION: 'http://192.168.1.17:8060',
        },
        {
          SERVER: 'Roku',
          LOCATION: 'http://192.168.1.17:8060',
        },
        {
          SERVER: 'Roku',
          LOCATION: 'http://192.168.1.17:8060',
        },
      ])

      const p = discoverAll(1000)
      vi.advanceTimersByTime(1000)

      const addresses = await p
      expect(addresses).toEqual(['http://192.168.1.17:8060'])
    })

    it('should reject if no devices are found', () => {
      __setHeaders(null)

      const p = discoverAll(1000)
      vi.advanceTimersByTime(1000)

      return expect(p).rejects.toThrow(/^Could not find any Roku devices/)
    })

    it('should ignore responses after stopping', async () => {
      __setHeaders([
        {
          SERVER: 'Roku',
          LOCATION: 'http://192.168.1.17:8060',
        },
        {
          SERVER: 'Roku',
          LOCATION: 'http://192.168.1.18:8060',
        },
        {
          SERVER: 'Roku',
          LOCATION: 'http://192.168.1.19:8060',
        },
      ])

      const p = discoverAll(1)
      // Advance just to the timeout, before all responses can fire
      vi.advanceTimersByTime(1)

      const addresses = await p
      expect(addresses).toEqual(['http://192.168.1.17:8060'])
    })

    it('should use the default timeout if none given', async () => {
      __setHeaders({
        SERVER: 'Roku',
        LOCATION: 'http://192.168.1.17:8060',
      })

      const p = discoverAll()
      vi.advanceTimersByTime(10000)

      const addresses = await p
      expect(addresses).toEqual(['http://192.168.1.17:8060'])
    })
  })
})
