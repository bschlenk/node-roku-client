const Fixtures = require('./fixtures')

module.exports = [
  {
    pattern: '192.168.1.17:8060/query/apps',
    fixtures: function(match, params, headers) {
      return true;
    },
    get: function(match, data) {
      return { text: Fixtures.AppsXML }
    }
  },
  {
    pattern: '192.168.1.17:8060/query/active-app',
    fixtures: function(match, params, headers) {
      return true;
    },
    get: function(match, data) {
      return { text: Fixtures.ActiveAppXML }
    }
  },
  {
    pattern: '192.168.1.17:8060/query/device-info',
    fixtures: function(match, params, headers) {
      return true;
    },
    get: function(match, data) {
      return { text: Fixtures.InfoXML }
    }
  },
  {
    pattern: '192.168.1.17:8060/keypress/(.*)',
    fixtures: function(match, params, headers) {
      let validKeys = ['Info']

      if (!!~validKeys.indexOf(match[1])) {
        return true;
      } else {
        let newErr = new Error(404);
        newErr.response = 'invalid key identifier';
        newErr.status = 404;
        throw newErr
      }
    },
    post: function(match, data) {
      return { status: 200 }
    }
  }
]