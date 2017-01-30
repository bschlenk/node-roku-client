const Fixtures = require('./xml-fixtures');

module.exports = [
  {
    pattern: '192.168.1.17:8060(.*)',
    fixtures: function (match, params, headers) {
      throw new Error(404);
    }
  }
];
