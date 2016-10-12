const fixtures = require('./fixtures')

module.exports = [
  {
    pattern: '192.168.1.17:8060/query/apps',
    fixtures: function(match, params, headers) {
      return {}
    },
    get: function (match, data) {
      return fixtures.appsXML
    }
  }
]