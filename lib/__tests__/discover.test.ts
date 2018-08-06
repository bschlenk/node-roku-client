import { discover, discoverAll } from '../discover';

const HEADERS = {
  'CACHE-CONTROL': 'max-age=3600',
  ST: 'urn:dial-multiscreen-org:service:dial:1',
  USN: 'uuid:00000000-0000-0000-0000-000000000000::urn:dial-multiscreen-org:service:dial:1',
  EXT: '',
  SERVER: 'Roku UPnP/1.0 MiniUPnPd/1.4',
  LOCATION: 'http://192.168.1.17:8060/dial/dd.xml',
};

describe('discover', () => {
  it('should resolve to the first roku ip address found', () => {
    require('node-ssdp').__setHeaders(HEADERS);

    discover().then((ipAddress) => {
      expect(ipAddress).toEqual('http://192.168.1.17:8060');
    });
  });

  it('should fail after the configured timeout', (done) => {
    require('node-ssdp').__setHeaders({});

    discover(1000).then(() => {
      done('should have failed');
    }).catch((err) => {
      expect(err).toBeDefined();
      expect(err).toBeInstanceOf(Error);
      done();
    });
  });

  it('should not find devices that are not roku', () => {
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
    return discover(1000).then((address) => {
      expect(address).toEqual('http://192.168.1.19:8060');
    });
  });
});

describe('discoverAll', () => {
  it('should find all devices', () => {
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
    return discoverAll(1000).then((addresses) => {
      expect(addresses.length).toEqual(3);
      expect(addresses).toEqual(expect.arrayContaining([
        'http://192.168.1.17:8060',
        'http://192.168.1.18:8060',
        'http://192.168.1.19:8060',
      ]));
    });
  });

  it('should not include duplicate addresses', () => {
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
    return discoverAll(1000).then((addresses) => {
      expect(addresses.length).toEqual(1);
      expect(addresses).toEqual(['http://192.168.1.17:8060']);
    });
  });

  it('should reject if no devices are found', (done) => {
    require('node-ssdp').__setHeaders(null);
    return discoverAll(1000).then(() => {
      done('should have failed');
    }).catch((err) => {
      expect(err).toBeDefined();
      expect(err).toBeInstanceOf(Error);
      done();
    });
  });
});
