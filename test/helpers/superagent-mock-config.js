
'use strict';

const Fixtures = require('./xml-fixtures');

module.exports = [
  {
    pattern: '192.168.1.17:8060/query/apps',
    fixtures: () => {
      return true;
    },
    get: () => {
      return { text: Fixtures.AppsXML };
    }
  },
  {
    pattern: '192.168.1.17:8060/query/active-app',
    fixtures: () => {
      return true;
    },
    get: () => {
      return { text: Fixtures.ActiveAppXML };
    }
  },
  {
    pattern: '192.168.1.17:8060/query/device-info',
    fixtures: () => {
      return true;
    },
    get: () => {
      return { text: Fixtures.InfoXML };
    }
  },
  {
    pattern: '192.168.1.17:8060/keypress/(.*)',
    fixtures: match => {
      const validKeys = ['Info', 'Home'];

      if (validKeys.indexOf(match[1]) === -1) {
        const newErr = new Error(404);
        newErr.response = 'invalid key identifier';
        newErr.status = 404;
        throw newErr;
      }
      return true;
    },
    post: () => {
      return { status: 200 };
    }
  },
  {
    pattern: '192.168.1.17:8060/keydown/(.*)',
    fixtures: match => {
      const validKeys = ['Info', 'Home'];

      if (validKeys.indexOf(match[1]) === -1) {
        const newErr = new Error(404);
        newErr.response = 'invalid key identifier';
        newErr.status = 404;
        throw newErr;
      }
      return true;
    },
    post: () => {
      return { status: 200 };
    }
  },
  {
    pattern: '192.168.1.17:8060/keyup/(.*)',
    fixtures: match => {
      const validKeys = ['Info', 'Home'];

      if (validKeys.indexOf(match[1]) === -1) {
        const newErr = new Error(404);
        newErr.response = 'invalid key identifier';
        newErr.status = 404;
        throw newErr;
      }
      return true;
    },
    post: () => {
      return { status: 200 };
    }
  },
  {
    pattern: '192.168.1.17:8060/query/icon/(.*)',
    fixtures: match => {
      const validKeys = ['12'];

      if (validKeys.indexOf(match[1]) === -1) {
        const newErr = new Error(404);
        newErr.response = 'invalid key identifier';
        newErr.status = 404;
        throw newErr;
      }
      return true;
    },
    get: () => {
      return { body: Fixtures.NetflixIcon };
    }
  },
  {
    pattern: '192.168.1.17:8060/launch/(.*)',
    fixtures: () => {},
    post: () => {
      return { status: 200 };
    }
  }
];
