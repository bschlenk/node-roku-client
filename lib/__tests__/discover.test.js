/* eslint-env jest */

import discover from '../discover';

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
    // eslint-disable-next-line
    require('node-ssdp').__setHeaders(HEADERS);

    discover().then((ipAddress) => {
      expect(ipAddress).toEqual('http://192.168.1.17:8060');
    });
  });

  it('should fail after the configured timeout', (done) => {
    // eslint-disable-next-line
    require('node-ssdp').__setHeaders({});

    discover(1000).then(() => {
      done('should have failed');
    }).catch((err) => {
      expect(err).toBeDefined();
      expect(err).toBeInstanceOf(Error);
      done();
    });
  });
});
