import { camelcase, maybeBoolean, queryString } from '../utils';

describe('utils', () => {
  describe('maybeBoolean', () => {
    it('should convert true/false strings', () => {
      expect(maybeBoolean('true')).toBe(true);
      expect(maybeBoolean('false')).toBe(false);
    });

    it('should not convert other strings', () => {
      expect(maybeBoolean('hello')).toEqual('hello');
      expect(maybeBoolean('goodbye')).toEqual('goodbye');
    });
  });

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
