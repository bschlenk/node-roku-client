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
  }
]