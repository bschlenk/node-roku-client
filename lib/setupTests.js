const fetch = require('jest-fetch-mock');
fetch.default = fetch;
jest.setMock('node-fetch', fetch);
