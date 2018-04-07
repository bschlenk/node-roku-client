const ssdp = jest.genMockFromModule('node-ssdp');

let headers = null;

class Client {
  /**
   * Construct a mock ssdp client.
   * @param {boolean} override Whether to triger events.
   */
  constructor() {
    this.searched = null;
    this.events = {};
  }

  /**
   * Mock .search()
   * @param {string} serviceType 'ssdp:all'
   */
  search(query) {
    this.searched = query;
    if (headers) {
      const callResponse = (index = null) => {
        const { response } = this.events;
        if (response) {
          if (index === null) {
            response(headers);
          } else {
            response(headers[index]);
          }
        }
      };
      if (Array.isArray(headers)) {
        let index = 0;
        const { length } = headers;
        setImmediate(function recurseResponses() {
          callResponse(index);
          index += 1;
          if (index < length) {
            setImmediate(recurseResponses);
          }
        });
      } else {
        setImmediate(callResponse);
      }
    }
  }

  /**
   * Mock .on() event listener method
   * @param {string}   eventName 'response'
   * @param {function} callback pass data back to callee
   * @return {{ SERVER: string, LOCATION: string }}
   */
  on(event, fn) {
    this.events[event] = fn;
  }

  stop() {}
}

ssdp.Client = Client;

ssdp.__setHeaders = function __setHeaders(h) {
  headers = h;
};

module.exports = ssdp;
