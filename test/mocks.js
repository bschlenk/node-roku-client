
/**
 * stubs node-ssdp client interface
 */
class Client {
  constructor() {}

  /**
   * stubs node-
   * @param  {[type]} serviceType 'ssdp:all'
   * @return null
   */
  search(serviceType) {

  }

  on(eventName, callback) {
      callback({
        'CACHE-CONTROL': 'max-age=3600',
        ST: 'urn:dial-multiscreen-org:service:dial:1',
        USN: 'uuid:00000000-0000-0000-0000-000000000000::urn:dial-multiscreen-org:service:dial:1',
        EXT: '',
        SERVER: 'Roku UPnP/1.0 MiniUPnPd/1.4',
        LOCATION: 'http://192.168.1.17:8060/dial/dd.xml'
      })
  }
}

module.exports = {
  Client: Client
}