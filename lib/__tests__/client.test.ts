/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import fs from 'node:fs'
import path from 'node:path'
import stream from 'node:stream'

import { __setHeaders } from 'node-ssdp'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ROKU_DEFAULT_PORT, RokuClient } from '../client.js'

const clientAddr = 'http://192.168.1.61:8060'

function loadResponse(name: string): string
function loadResponse(name: string, asBuffer: false): string
function loadResponse(name: string, asBuffer: true): ReadableStream
function loadResponse(name: string, asBuffer = false) {
  const file = name.includes('.') ? name : `${name}.xml`
  const data = fs.readFileSync(path.join(import.meta.dirname, 'assets', file))
  if (!asBuffer) {
    return data.toString('utf-8')
  }
  const bufferStream = new stream.PassThrough()
  bufferStream.end(data)
  return bufferStream as unknown as ReadableStream
}

describe('Client', () => {
  let client: RokuClient

  beforeEach(() => {
    client = new RokuClient(clientAddr)
    fetchMock.resetMocks()

    vi.useFakeTimers()
  })

  describe('#discover()', () => {
    it('should resolve to a client instance for the first address found', async () => {
      __setHeaders({
        SERVER: 'Roku UPnP/1.0 MiniUPnPd/1.4',
        LOCATION: 'http://192.168.1.17:8060/dial/dd.xml',
      })
      const p = RokuClient.discover()
      const c = await p
      expect(c).toBeInstanceOf(RokuClient)
      expect(c.ip).toEqual(new URL('http://192.168.1.17:8060'))
    })
  })

  describe('#discoverAll()', () => {
    it('should resolve to an array of devices', async () => {
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

      const p = RokuClient.discoverAll(1000)
      vi.advanceTimersByTime(1000)
      const clients = await p
      expect(clients.length).toEqual(3)
      expect(clients[0].ip).toEqual('http://192.168.1.17:8060')
      expect(clients[1].ip).toEqual('http://192.168.1.18:8060')
      expect(clients[2].ip).toEqual('http://192.168.1.19:8060')
    })
  })

  describe('#constructor()', () => {
    it('should construct a new Client object', () => {
      expect(client).toBeDefined()
      expect(client.ip).toEqual(new URL(clientAddr))
    })

    it('should add missing http://', () => {
      const c = new RokuClient('192.168.1.2:1111')
      expect(c.ip).toEqual(new URL('http://192.168.1.2:1111'))
    })

    it('should add the default port if omitted', () => {
      const c = new RokuClient('192.168.1.2')
      expect(c.ip).toEqual(new URL(`http://192.168.1.2:${ROKU_DEFAULT_PORT}`))
    })
  })

  describe('#apps()', () => {
    it('should return a list of apps', async () => {
      fetchMock.mockResponse(loadResponse('apps'))
      const apps = await client.apps()
      expect(apps).toBeInstanceOf(Array)
      apps.forEach((app) => {
        expect(app).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            type: expect.any(String),
            version: expect.any(String),
          }),
        )
      })
    })

    it('should reject if the status is not ok', () => {
      fetchMock.mockResponse('', { status: 404 })
      return expect(client.apps()).rejects.toThrow(/^Failed to GET/)
    })
  })

  describe('#active()', () => {
    it('should return the active app', async () => {
      fetchMock.mockResponse(loadResponse('active-app'))
      const app = await client.active()
      expect(app).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          type: expect.any(String),
          version: expect.any(String),
        }),
      )
    })

    it('should return null if there is not an active app', async () => {
      fetchMock.mockResponse(loadResponse('active-app-none'))
      const app = await client.active()
      expect(app).toBeNull()
    })

    it('should reject if multiple apps are returned', () => {
      fetchMock.mockResponse(loadResponse('active-multiple'))
      return expect(client.active()).rejects.toThrow()
    })
  })

  describe('#info()', () => {
    it('should return info for the roku device', async () => {
      fetchMock.mockResponse(loadResponse('info'))
      const info = await client.info()
      expect(info).toBeInstanceOf(Object)
      expect(Object.keys(info).length).toEqual(29)
      expect(info).not.toHaveProperty('model-name')
      expect(info.modelName).toEqual('Roku 3')
      expect(info.secureDevice).toBe(true)
      expect(info).toMatchSnapshot()
    })
  })

  describe('#keypress()', () => {
    it('should press the home button', async () => {
      await client.keypress('Home')
      expect(fetch).toHaveBeenCalledWith(new URL('/keypress/Home', client.ip), {
        method: 'POST',
      })
    })

    it('should send a Lit_ command if a single character is passed in', async () => {
      await client.keypress('a')
      expect(fetch).toHaveBeenCalledWith(
        new URL('/keypress/Lit_a', client.ip),
        { method: 'POST' },
      )
    })

    it('should url encode Lit_ commands for utf-8 characters', async () => {
      await client.keypress('€')
      expect(fetch).toHaveBeenCalledWith(
        new URL('/keypress/Lit_%E2%82%AC', client.ip),
        { method: 'POST' },
      )
    })
  })

  describe('#keydown()', () => {
    it('should press and hold the pause', async () => {
      await client.keydown('Pause')
      expect(fetch).toHaveBeenCalledWith(new URL('/keydown/Pause', client.ip), {
        method: 'POST',
      })
    })
  })

  describe('#keyup()', () => {
    it('should release the info button', async () => {
      await client.keyup('Info')
      expect(fetch).toHaveBeenCalledWith(new URL('/keyup/Info', client.ip), {
        method: 'POST',
      })
    })
  })

  describe('#icon()', () => {
    it('should fetch the icon', async () => {
      const response = new Response(loadResponse('netflix.jpeg', true), {
        headers: new Headers({ 'content-type': 'image/jpeg' }),
      })
      fetchMock.mockImplementation(() => Promise.resolve(response))
      const icon = await client.icon('12')
      expect(icon.type).toEqual('image/jpeg')
      expect(icon.extension).toEqual('.jpeg')
      expect(icon.response).toBe(response)
    })

    it('should be okay without a content-type', async () => {
      const response = new Response(loadResponse('netflix.jpeg', true), {
        headers: new Headers({}),
      })
      fetchMock.mockImplementation(() => Promise.resolve(response))
      const icon = await client.icon('12')
      expect(icon.type).toBeUndefined()
      expect(icon.extension).toBeUndefined()
      expect(icon.response).toBe(response)
    })

    it('should be okay if type is not image', async () => {
      const response = new Response(loadResponse('netflix.jpeg', true), {
        headers: new Headers({
          'content-type': 'application/json',
        }),
      })
      fetchMock.mockImplementation(() => Promise.resolve(response))
      const icon = await client.icon('12')
      expect(icon.type).toEqual('application/json')
      expect(icon.extension).toBeUndefined()
      expect(icon.response).toBe(response)
    })
  })

  describe('#launch()', () => {
    it('should call launch for the given app id', async () => {
      await client.launch('12345')
      expect(fetch).toHaveBeenCalledWith(new URL('/launch/12345', client.ip), {
        method: 'POST',
      })
    })

    it('should reject if the request status is not ok', () => {
      fetchMock.mockResponse('', { status: 404 })
      return expect(client.launch('12345')).rejects.toThrow(/^Failed to POST/)
    })
  })

  describe('#launchDtv()', () => {
    it('should call launch/tvinput.dtv', async () => {
      await client.launchDtv()
      expect(fetch).toHaveBeenCalledWith(
        new URL('/launch/tvinput.dtv', client.ip),
        { method: 'POST' },
      )
    })

    it('should pass a channel string to launch', async () => {
      await client.launchDtv('1.1')
      expect(fetch).toHaveBeenCalledWith(
        new URL('/launch/tvinput.dtv?ch=1.1', client.ip),
        { method: 'POST' },
      )
    })

    it('should pass a channel number to launch', async () => {
      await client.launchDtv(8.5)
      expect(fetch).toHaveBeenCalledWith(
        new URL('/launch/tvinput.dtv?ch=8.5', client.ip),
        { method: 'POST' },
      )
    })
  })

  describe('#text()', () => {
    it('should send a Lit_ command for each letter', async () => {
      await client.text('hello')
      expect(fetchMock.mock.calls).toEqual([
        [new URL('/keypress/Lit_h', client.ip), { method: 'POST' }],
        [new URL('/keypress/Lit_e', client.ip), { method: 'POST' }],
        [new URL('/keypress/Lit_l', client.ip), { method: 'POST' }],
        [new URL('/keypress/Lit_l', client.ip), { method: 'POST' }],
        [new URL('/keypress/Lit_o', client.ip), { method: 'POST' }],
      ])
    })
  })

  describe('#command()', () => {
    it('should allow chaining remote commands', async () => {
      await client.command().volumeUp().select().text('abc').send()

      expect(fetchMock.mock.calls).toEqual([
        [new URL('/keypress/VolumeUp', client.ip), { method: 'POST' }],
        [new URL('/keypress/Select', client.ip), { method: 'POST' }],
        [new URL('/keypress/Lit_a', client.ip), { method: 'POST' }],
        [new URL('/keypress/Lit_b', client.ip), { method: 'POST' }],
        [new URL('/keypress/Lit_c', client.ip), { method: 'POST' }],
      ])
    })
  })

  describe('#search()', () => {
    it('should treat a string arg as the keyword', async () => {
      await client.search('pokemon')

      expect(fetch).toHaveBeenCalledWith(
        new URL('/search/browse?keyword=pokemon', client.ip),
        { method: 'POST' },
      )
    })

    it('should accept an object for complext searches', async () => {
      await client.search({
        keyword: 'hello',
        showUnavailable: true,
        matchAny: true,
      })

      expect(fetch).toHaveBeenCalledWith(
        new URL(
          '/search/browse?keyword=hello&show-unavailable=true&match-any=true',
          client.ip,
        ),
        { method: 'POST' },
      )
    })

    it('should use provider-id if it is given as a number', async () => {
      await client.search({ keyword: 'hello', provider: 123 })

      expect(fetch).toHaveBeenCalledWith(
        new URL('/search/browse?keyword=hello&provider-id=123', client.ip),
        { method: 'POST' },
      )
    })

    it('should use provider if it is given as a string', async () => {
      await client.search({ keyword: 'hello', provider: 'netflix' })

      expect(fetch).toHaveBeenCalledWith(
        new URL('/search/browse?keyword=hello&provider=netflix', client.ip),
        { method: 'POST' },
      )
    })

    it('should accept provider as an array of numbers', async () => {
      await client.search({ title: 'borat', provider: [1, 2, 3] })

      expect(fetch).toHaveBeenCalledWith(
        new URL('/search/browse?title=borat&provider-id=1%2C2%2C3', client.ip),
        { method: 'POST' },
      )
    })

    it('should accept provider as an array of strings', async () => {
      await client.search({ title: 'dumbo', provider: ['disney', 'amazon'] })

      expect(fetch).toHaveBeenCalledWith(
        new URL(
          '/search/browse?title=dumbo&provider=disney%2Camazon',
          client.ip,
        ),
        { method: 'POST' },
      )
    })

    it('should url encode the request', async () => {
      await client.search({ title: 'Amélie' })

      expect(fetch).toHaveBeenCalledWith(
        new URL('/search/browse?title=Am%C3%A9lie', client.ip),
        { method: 'POST' },
      )
    })
  })

  describe('#mediaPlayer()', () => {
    it('should parse the response', async () => {
      fetchMock.mockResponse(loadResponse('media-player'))
      const res = await client.mediaPlayer()
      expect(res).toMatchSnapshot()
    })
  })
})
