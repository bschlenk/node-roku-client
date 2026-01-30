import * as fs from 'fs'
import * as path from 'path'
import * as stream from 'stream'
import { RokuClient, ROKU_DEFAULT_PORT } from '../client'
import fetchPonyfill from 'fetch-ponyfill'
import { FetchMock } from 'jest-fetch-mock'

const fetchObjects = fetchPonyfill()
const fetch = fetchObjects.fetch as FetchMock

const clientAddr = 'http://192.168.1.61:8060'

function loadResponse(name: string): string
function loadResponse(name: string, asBuffer: false): string
function loadResponse(name: string, asBuffer: true): ReadableStream
function loadResponse(name: string, asBuffer = false) {
  const file = name.includes('.') ? name : `${name}.xml`
  const data = fs.readFileSync(path.join(__dirname, 'assets', file))
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
    fetch.resetMocks()

    jest.useFakeTimers()
  })

  describe('#discover()', () => {
    it('should resolve to a client instance for the first address found', async () => {
      require('node-ssdp').__setHeaders({
        SERVER: 'Roku UPnP/1.0 MiniUPnPd/1.4',
        LOCATION: 'http://192.168.1.17:8060/dial/dd.xml',
      })
      const p = RokuClient.discover()
      jest.runAllTimers()
      const c = await p
      expect(c).toBeInstanceOf(RokuClient)
      expect(c.ip).toEqual('http://192.168.1.17:8060')
    })
  })

  describe('#discoverAll()', () => {
    it('should resolve to an array of devices', async () => {
      require('node-ssdp').__setHeaders([
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
      jest.advanceTimersByTime(1000)
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
      expect(client.ip).toEqual(clientAddr)
    })

    it('should add missing http://', () => {
      const c = new RokuClient('192.168.1.2:1111')
      expect(c.ip).toEqual('http://192.168.1.2:1111')
    })

    it('should add the default port if omitted', () => {
      const c = new RokuClient('192.168.1.2')
      expect(c.ip).toEqual(`http://192.168.1.2:${ROKU_DEFAULT_PORT}`)
    })
  })

  describe('#apps()', () => {
    it('should return a list of apps', async () => {
      fetch.mockResponse(loadResponse('apps'))
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
      fetch.mockResponse('', { status: 404 })
      return expect(client.apps()).rejects.toThrow(/^Failed to GET/)
    })
  })

  describe('#active()', () => {
    it('should return the active app', async () => {
      fetch.mockResponse(loadResponse('active-app'))
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
      fetch.mockResponse(loadResponse('active-app-none'))
      const app = await client.active()
      expect(app).toBeNull()
    })

    it('should reject if multiple apps are returned', () => {
      fetch.mockResponse(loadResponse('active-multiple'))
      return expect(client.active()).rejects.toThrow()
    })
  })

  describe('#info()', () => {
    it('should return info for the roku device', async () => {
      fetch.mockResponse(loadResponse('info'))
      const info = await client.info()
      expect(info).toBeInstanceOf(Object)
      expect(Object.keys(info).length).toEqual(29)
      expect((info as any)['model-name']).toBeUndefined()
      expect(info.modelName).toEqual('Roku 3')
      expect(info.secureDevice).toBe(true)
      expect(info).toMatchSnapshot()
    })
  })

  describe('#keypress()', () => {
    it('should press the home button', async () => {
      await client.keypress('Home')
      expect(fetch).toHaveBeenCalledWith(`${clientAddr}/keypress/Home`, {
        method: 'POST',
      })
    })

    it('should send a Lit_ command if a single character is passed in', async () => {
      await client.keypress('a')
      expect(fetch).toHaveBeenCalledWith(`${clientAddr}/keypress/Lit_a`, {
        method: 'POST',
      })
    })

    it('should url encode Lit_ commands for utf-8 characters', async () => {
      await client.keypress('€')
      expect(fetch).toHaveBeenCalledWith(
        `${clientAddr}/keypress/Lit_%E2%82%AC`,
        {
          method: 'POST',
        },
      )
    })
  })

  describe('#keydown()', () => {
    it('should press and hold the pause', async () => {
      await client.keydown('Pause')
      expect(fetch).toHaveBeenCalledWith(`${clientAddr}/keydown/Pause`, {
        method: 'POST',
      })
    })
  })

  describe('#keyup()', () => {
    it('should release the info button', async () => {
      await client.keyup('Info')
      expect(fetch).toHaveBeenCalledWith(`${clientAddr}/keyup/Info`, {
        method: 'POST',
      })
    })
  })

  describe('#icon()', () => {
    it('should fetch the icon', async () => {
      const response = new fetchObjects.Response(
        loadResponse('netflix.jpeg', true),
        { headers: new fetchObjects.Headers({ 'content-type': 'image/jpeg' }) },
      )
      fetch.mockImplementation(() => Promise.resolve(response))
      const icon = await client.icon('12')
      expect(icon.type).toEqual('image/jpeg')
      expect(icon.extension).toEqual('.jpeg')
      expect(icon.response).toBe(response)
    })

    it('should be okay without a content-type', async () => {
      const response = new fetchObjects.Response(
        loadResponse('netflix.jpeg', true),
        { headers: new fetchObjects.Headers({}) },
      )
      fetch.mockImplementation(() => Promise.resolve(response))
      const icon = await client.icon('12')
      expect(icon.type).toBeUndefined()
      expect(icon.extension).toBeUndefined()
      expect(icon.response).toBe(response)
    })

    it('should be okay if type is not image', async () => {
      const response = new fetchObjects.Response(
        loadResponse('netflix.jpeg', true),
        {
          headers: new fetchObjects.Headers({
            'content-type': 'application/json',
          }),
        },
      )
      fetch.mockImplementation(() => Promise.resolve(response))
      const icon = await client.icon('12')
      expect(icon.type).toEqual('application/json')
      expect(icon.extension).toBeUndefined()
      expect(icon.response).toBe(response)
    })
  })

  describe('#launch()', () => {
    it('should call launch for the given app id', async () => {
      await client.launch('12345')
      expect(fetch).toHaveBeenCalledWith(`${client.ip}/launch/12345`, {
        method: 'POST',
      })
    })

    it('should reject if the request status is not ok', () => {
      fetch.mockResponse('', { status: 404 })
      return expect(client.launch('12345')).rejects.toThrow(/^Failed to POST/)
    })
  })

  describe('#launchDtv()', () => {
    it('should call launch/tvinput.dtv', async () => {
      await client.launchDtv()
      expect(fetch).toHaveBeenCalledWith(`${client.ip}/launch/tvinput.dtv`, {
        method: 'POST',
      })
    })

    it('should pass a channel string to launch', async () => {
      await client.launchDtv('1.1')
      expect(fetch).toHaveBeenCalledWith(
        `${client.ip}/launch/tvinput.dtv?ch=1.1`,
        {
          method: 'POST',
        },
      )
    })

    it('should pass a channel number to launch', async () => {
      await client.launchDtv(8.5)
      expect(fetch).toHaveBeenCalledWith(
        `${client.ip}/launch/tvinput.dtv?ch=8.5`,
        {
          method: 'POST',
        },
      )
    })
  })

  describe('#text()', () => {
    it('should send a Lit_ command for each letter', async () => {
      await client.text('hello')
      expect(fetch.mock.calls).toEqual([
        [`${client.ip}/keypress/Lit_h`, { method: 'POST' }],
        [`${client.ip}/keypress/Lit_e`, { method: 'POST' }],
        [`${client.ip}/keypress/Lit_l`, { method: 'POST' }],
        [`${client.ip}/keypress/Lit_l`, { method: 'POST' }],
        [`${client.ip}/keypress/Lit_o`, { method: 'POST' }],
      ])
    })
  })

  describe('#command()', () => {
    it('should allow chaining remote commands', async () => {
      await client.command().volumeUp().select().text('abc').send()

      expect(fetch.mock.calls).toEqual([
        [`${client.ip}/keypress/VolumeUp`, { method: 'POST' }],
        [`${client.ip}/keypress/Select`, { method: 'POST' }],
        [`${client.ip}/keypress/Lit_a`, { method: 'POST' }],
        [`${client.ip}/keypress/Lit_b`, { method: 'POST' }],
        [`${client.ip}/keypress/Lit_c`, { method: 'POST' }],
      ])
    })
  })

  describe('#search()', () => {
    it('should treat a string arg as the keyword', async () => {
      await client.search('pokemon')

      expect(fetch).toHaveBeenCalledWith(
        `${client.ip}/search/browse?keyword=pokemon`,
        {
          method: 'POST',
        },
      )
    })

    it('should accept an object for complext searches', async () => {
      await client.search({
        keyword: 'hello',
        showUnavailable: true,
        matchAny: true,
      })

      expect(fetch).toHaveBeenCalledWith(
        `${client.ip}/search/browse?keyword=hello&show-unavailable=true&match-any=true`,
        {
          method: 'POST',
        },
      )
    })

    it('should use provider-id if it is given as a number', async () => {
      await client.search({ keyword: 'hello', provider: 123 })

      expect(fetch).toHaveBeenCalledWith(
        `${client.ip}/search/browse?keyword=hello&provider-id=123`,
        {
          method: 'POST',
        },
      )
    })

    it('should use provider if it is given as a string', async () => {
      await client.search({ keyword: 'hello', provider: 'netflix' })

      expect(fetch).toHaveBeenCalledWith(
        `${client.ip}/search/browse?keyword=hello&provider=netflix`,
        {
          method: 'POST',
        },
      )
    })

    it('should accept provider as an array of numbers', async () => {
      await client.search({ title: 'borat', provider: [1, 2, 3] })

      expect(fetch).toHaveBeenCalledWith(
        `${client.ip}/search/browse?title=borat&provider-id=1%2C2%2C3`,
        {
          method: 'POST',
        },
      )
    })

    it('should accept provider as an array of strings', async () => {
      await client.search({ title: 'dumbo', provider: ['disney', 'amazon'] })

      expect(fetch).toHaveBeenCalledWith(
        `${client.ip}/search/browse?title=dumbo&provider=disney%2Camazon`,
        {
          method: 'POST',
        },
      )
    })

    it('should url encode the request', async () => {
      await client.search({ title: 'Amélie' })

      expect(fetch).toHaveBeenCalledWith(
        `${client.ip}/search/browse?title=Am%C3%A9lie`,
        {
          method: 'POST',
        },
      )
    })
  })

  describe('#mediaPlayer()', () => {
    it('should parse the response', async () => {
      fetch.mockResponse(loadResponse('media-player'))
      const res = await client.mediaPlayer()
      expect(res).toMatchSnapshot()
    })
  })
})
