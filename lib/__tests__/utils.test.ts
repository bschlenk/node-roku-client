import { maybeBoolean } from '../utils';

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
});
