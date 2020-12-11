const ssdp = jest.genMockFromModule('node-ssdp');

let headers = null;

class Client {
  /**
   * Construct a mock ssdp client.
   */
  constructor() {
    this.searched = null;
    this.events = {};
  }

  /**
   * Mock .search()
   * @param {string} query 'ssdp:all'
   */
  search(query) {
    this.searched = query;
    if (!headers) {
      return;
    }
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
      setTimeout(function recurseResponses() {
        callResponse(index);
        index += 1;
        if (index < length) {
          setTimeout(recurseResponses, 0);
        }
      }, 0);
    } else {
      setTimeout(callResponse, 0);
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
