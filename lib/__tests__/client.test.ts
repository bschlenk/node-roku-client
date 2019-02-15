/* eslint-env jest */

import * as fs from 'fs';
import * as path from 'path';
import * as stream from 'stream';
import Client from '../client';
import fetchPonyfill = require('fetch-ponyfill');
import { FetchMock } from 'jest-fetch-mock';

const fetchObjects = fetchPonyfill();
const fetch = fetchObjects.fetch as FetchMock;

const clientAddr = 'http://192.168.1.61:8060';

function loadResponse(name: string): string;
function loadResponse(name: string, asBuffer: false): string;
function loadResponse(name: string, asBuffer: true): ReadableStream;
function loadResponse(name: string, asBuffer = false) {
  const file = name.includes('.') ? name : `${name}.xml`;
  const data = fs.readFileSync(path.join(__dirname, 'assets', file));
  if (!asBuffer) {
    return data.toString('utf-8');
  }
  const bufferStream = new stream.PassThrough();
  bufferStream.end(data);
  return (bufferStream as unknown) as ReadableStream;
}

describe('Client', () => {
  let client: Client;

  beforeEach(() => {
    client = new Client(clientAddr);
    // eslint-disable-next-line global-require
    fetch.mockClear();
  });

  describe('#discover()', () => {
    it('should resolve to a client instance for the first address found', () => {
      // eslint-disable-next-line
      require('node-ssdp').__setHeaders({
        SERVER: 'Roku UPnP/1.0 MiniUPnPd/1.4',
        LOCATION: 'http://192.168.1.17:8060/dial/dd.xml',
      });
      return Client.discover().then(c => {
        expect(c).toBeInstanceOf(Client);
        expect(c.ip).toEqual('http://192.168.1.17:8060');
      });
    });
  });

  describe('#constructor()', () => {
    it('should construct a new Client object', () => {
      expect(client).toBeDefined();
      expect(client.ip).toEqual(clientAddr);
    });
  });

  describe('#apps()', () => {
    it('should return a list of apps', () => {
      // eslint-disable-next-line global-require
      fetch.mockResponse(loadResponse('apps'));
      return client.apps().then(apps => {
        expect(apps).toBeInstanceOf(Array);
        apps.forEach(app => {
          expect(app).toEqual(
            expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
              type: expect.any(String),
              version: expect.any(String),
            }),
          );
        });
      });
    });
  });

  describe('#active()', () => {
    it('should return the active app', () => {
      // eslint-disable-next-line global-require
      fetch.mockResponse(loadResponse('active-app'));
      return client.active().then(app => {
        expect(app).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            type: expect.any(String),
            version: expect.any(String),
          }),
        );
      });
    });

    it('should return null if there is not an active app', () => {
      // eslint-disable-next-line global-require
      fetch.mockResponse(loadResponse('active-app-none'));
      return client.active().then(app => {
        expect(app).toBeNull();
      });
    });

    it('should reject if multiple apps are returned', () => {
      // eslint-disable-next-line global-require
      fetch.mockResponse(loadResponse('active-multiple'));
      return client
        .active()
        .then(() => {
          throw new Error('Should have thrown');
        })
        .catch(err => {
          expect(err).toBeDefined();
          expect(err).toBeInstanceOf(Error);
        });
    });
  });

  describe('#info()', () => {
    it('should return info for the roku device', () => {
      // eslint-disable-next-line global-require
      fetch.mockResponse(loadResponse('info'));
      return client.info().then(info => {
        expect(info).toBeInstanceOf(Object);
        expect(Object.keys(info).length).toEqual(29);
        expect(info['model-name']).toBeUndefined();
        expect(info.modelName).toEqual('Roku 3');
      });
    });
  });

  describe('#keypress()', () => {
    it('should press the home button', () =>
      client.keypress('Home').then(() => {
        // eslint-disable-next-line global-require
        expect(fetch).toHaveBeenCalledWith(`${clientAddr}/keypress/Home`, {
          method: 'POST',
        });
      }));

    it('should send a Lit_ command if a single character is passed in', () => {
      client.keypress('a').then(() => {
        // eslint-disable-next-line global-require
        expect(fetch).toHaveBeenCalledWith(`${clientAddr}/keypress/Lit_a`, {
          method: 'POST',
        });
      });
    });

    it('should url encode Lit_ commands for utf-8 characters', () => {
      client.keypress('€').then(() => {
        // eslint-disable-next-line global-require
        expect(fetch).toHaveBeenCalledWith(
          `${clientAddr}/keypress/Lit_%E2%82%AC`,
          { method: 'POST' },
        );
      });
    });
  });

  describe('#keydown()', () => {
    it('should press and hold the pause', () =>
      client.keydown('Pause').then(() => {
        // eslint-disable-next-line global-require
        expect(fetch).toHaveBeenCalledWith(`${clientAddr}/keydown/Pause`, {
          method: 'POST',
        });
      }));
  });

  describe('#keyup()', () => {
    it('should release the info button', () =>
      client.keyup('Info').then(() => {
        // eslint-disable-next-line global-require
        expect(fetch).toHaveBeenCalledWith(`${clientAddr}/keyup/Info`, {
          method: 'POST',
        });
      }));
  });

  describe('#icon()', () => {
    it('should download the icon to the given folder', () => {
      // eslint-disable-next-line global-require
      const response = new fetchObjects.Response(
        loadResponse('netflix.jpeg', true),
        { headers: new fetchObjects.Headers({ 'content-type': 'image/jpeg' }) },
      );
      fetch.mockImplementation(() => Promise.resolve(response));
      return client.icon('12').then(icon => {
        expect(icon.type).toEqual('image/jpeg');
        expect(icon.extension).toEqual('.jpeg');
        expect(icon.response).toBe(response);
      });
    });
  });

  describe('#launch()', () => {
    it('should call launch for the given app id', () =>
      client.launch('12345').then(() => {
        // eslint-disable-next-line global-require
        expect(fetch).toHaveBeenCalledWith(`${client.ip}/launch/12345`, {
          method: 'POST',
        });
      }));
  });

  describe('#launchDtv()', () => {
    it('should call launch/tvinput.dtv', () => {
      client.launchDtv().then(() => {
        // eslint-disable-next-line global-require
        expect(fetch).toHaveBeenCalledWith(`${client.ip}/launch/tvinput.dtv`, {
          method: 'POST',
        });
      });
    });

    it('should pass a channel string to launch', () => {
      client.launchDtv('1.1').then(() => {
        // eslint-disable-next-line global-require
        expect(fetch).toHaveBeenCalledWith(
          `${client.ip}/launch/tvinput.dtv?ch=1.1`,
          { method: 'POST' },
        );
      });
    });

    it('should pass a channel number to launch', () => {
      client.launchDtv(8.5).then(() => {
        // eslint-disable-next-line global-require
        expect(fetch).toHaveBeenCalledWith(
          `${client.ip}/launch/tvinput.dtv?ch=8.5`,
          { method: 'POST' },
        );
      });
    });
  });

  describe('#text()', () => {
    it('should send a Lit_ command for each letter', () =>
      client.text('hello').then(() => {
        // eslint-disable-next-line global-require
        expect(fetch.mock.calls).toEqual([
          [`${client.ip}/keypress/Lit_h`, { method: 'POST' }],
          [`${client.ip}/keypress/Lit_e`, { method: 'POST' }],
          [`${client.ip}/keypress/Lit_l`, { method: 'POST' }],
          [`${client.ip}/keypress/Lit_l`, { method: 'POST' }],
          [`${client.ip}/keypress/Lit_o`, { method: 'POST' }],
        ]);
      }));
  });

  describe('#command()', () => {
    it('should allow chaining remote commands', () =>
      client
        .command()
        .volumeUp()
        .select()
        .text('abc')
        .send()
        .then(() => {
          // eslint-disable-next-line global-require
          expect(fetch.mock.calls).toEqual([
            [`${client.ip}/keypress/VolumeUp`, { method: 'POST' }],
            [`${client.ip}/keypress/Select`, { method: 'POST' }],
            [`${client.ip}/keypress/Lit_a`, { method: 'POST' }],
            [`${client.ip}/keypress/Lit_b`, { method: 'POST' }],
            [`${client.ip}/keypress/Lit_c`, { method: 'POST' }],
          ]);
        }));
  });
});
