import { camelcase, queryString } from '../utils';

describe('utils', () => {
  describe('camelcase', () => {
    it('should camelCase snake-case strings', () => {
      expect(camelcase('device-name')).toEqual('deviceName');
      expect(camelcase('some-other-string')).toEqual('someOtherString');
    });
  });

  describe('queryString', () => {
    it('should format as a query string', () => {
      const qs = queryString({
        'param with $p€ci@l characters': 'valueA',
        paramB: 'paramB',
        paramC: 'value with &pec!@| characters',
        boolParam: true,
        numParam: 42,
      });

      expect(qs).toEqual(
        'param%20with%20%24p%E2%82%ACci%40l%20characters=valueA&paramB=paramB&paramC=value%20with%20%26pec!%40%7C%20characters&boolParam=true&numParam=42',
      );
    });
  });
});
