import { discover, discoverAll } from '../discover';

const HEADERS = {
  'CACHE-CONTROL': 'max-age=3600',
  ST: 'urn:dial-multiscreen-org:service:dial:1',
  USN:
    'uuid:00000000-0000-0000-0000-000000000000::urn:dial-multiscreen-org:service:dial:1',
  EXT: '',
  SERVER: 'Roku UPnP/1.0 MiniUPnPd/1.4',
  LOCATION: 'http://192.168.1.17:8060/dial/dd.xml',
};

describe('discover', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  describe('discover', () => {
    it('should resolve to the first roku ip address found', async () => {
      require('node-ssdp').__setHeaders(HEADERS);

      const p = discover();
      jest.runAllTimers();

      const address = await p;
      expect(address).toEqual('http://192.168.1.17:8060');
    });

    it('should fail after the configured timeout', () => {
      require('node-ssdp').__setHeaders({});

      const p = discover(1000);
      jest.advanceTimersByTime(1000);

      return expect(p).rejects.toThrow();
    });

    it('should not find devices that are not roku', async () => {
      require('node-ssdp').__setHeaders([
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
      ]);

      const p = discover(1000);
      jest.runAllTimers();

      const address = await p;
      expect(address).toEqual('http://192.168.1.19:8060');
    });
  });

  describe('discoverAll', () => {
    it('should find all devices', async () => {
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
      ]);

      const p = discoverAll(1000);
      jest.advanceTimersByTime(1000);

      const addresses = await p;
      expect(addresses).toEqual([
        'http://192.168.1.17:8060',
        'http://192.168.1.18:8060',
        'http://192.168.1.19:8060',
      ]);
    });

    it('should not include duplicate addresses', async () => {
      require('node-ssdp').__setHeaders([
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
      ]);

      const p = discoverAll(1000);
      jest.advanceTimersByTime(1000);

      const addresses = await p;
      expect(addresses).toEqual(['http://192.168.1.17:8060']);
    });

    it('should reject if no devices are found', () => {
      require('node-ssdp').__setHeaders(null);

      const p = discoverAll(1000);
      jest.advanceTimersByTime(1000);

      return expect(p).rejects.toThrow(/^Could not find any Roku devices/);
    });

    it('should ignore responses after stopping', async () => {
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
      ]);

      const p = discoverAll(0);
      jest.advanceTimersByTime(100);

      const addresses = await p;
      expect(addresses).toEqual(['http://192.168.1.17:8060']);
    });

    it('should use the default timeout if none given', async () => {
      require('node-ssdp').__setHeaders({
        SERVER: 'Roku',
        LOCATION: 'http://192.168.1.17:8060',
      });

      const p = discoverAll();
      jest.advanceTimersByTime(10000);

      const addresses = await p;
      expect(addresses).toEqual(['http://192.168.1.17:8060']);
    });
  });
});
