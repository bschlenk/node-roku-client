const fetch = require('jest-fetch-mock');
const fetchPonyfill = require('fetch-ponyfill');

jest.setMock('fetch-ponyfill', () => {
  const { Headers, Request, Response } = fetchPonyfill();
  return {
    fetch,
    Headers,
    Request,
    Response,
  };
});
