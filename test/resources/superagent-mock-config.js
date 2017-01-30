
'use strict';

const Fixtures = require('./xml-fixtures');

module.exports = [
  {
    pattern: '192.168.1.17:8060/query/apps',
    fixtures: function () {
      return true;
    },
    get: function () {
      return { text: Fixtures.AppsXML };
    }
  },
  {
    pattern: '192.168.1.17:8060/query/active-app',
    fixtures: function () {
      return true;
    },
    get: function () {
      return { text: Fixtures.ActiveAppXML };
    }
  },
  {
    pattern: '192.168.1.17:8060/query/device-info',
    fixtures: function () {
      return true;
    },
    get: function () {
      return { text: Fixtures.InfoXML };
    }
  },
  {
    pattern: '192.168.1.17:8060/keypress/(.*)',
    fixtures: function (match) {
      let validKeys = ['Info', 'Home'];

      if (validKeys.indexOf(match[1]) === -1) {
        let newErr = new Error(404);
        newErr.response = 'invalid key identifier';
        newErr.status = 404;
        throw newErr;
      }
      return true;
    },
    post: function () {
      return { status: 200 };
    }
  },
  {
    pattern: '192.168.1.17:8060/keydown/(.*)',
    fixtures: function (match) {
      let validKeys = ['Info', 'Home'];

      if (validKeys.indexOf(match[1]) === -1) {
        let newErr = new Error(404);
        newErr.response = 'invalid key identifier';
        newErr.status = 404;
        throw newErr;
      }
      return true;
    },
    post: function () {
      return { status: 200 };
    }
  },
  {
    pattern: '192.168.1.17:8060/keyup/(.*)',
    fixtures: function (match) {
      let validKeys = ['Info', 'Home'];

      if (validKeys.indexOf(match[1]) === -1) {
        let newErr = new Error(404);
        newErr.response = 'invalid key identifier';
        newErr.status = 404;
        throw newErr;
      }
      return true;
    },
    post: function () {
      return { status: 200 };
    }
  },
  {
    pattern: '192.168.1.17:8060/query/icon/(.*)',
    fixtures: function (match) {
      let validKeys = ['12'];

      if (validKeys.indexOf(match[1]) === -1) {
        let newErr = new Error(404);
        newErr.response = 'invalid key identifier';
        newErr.status = 404;
        throw newErr;
      }
      return true;
    },
    get: function () {
      return { body: Fixtures.NetflixIcon };
    }
  },
  {
    pattern: '192.168.1.17:8060/launch/(.*)',
    fixtures: function () {},
    post: function () {
      return { status: 200 };
    }
  }
];
