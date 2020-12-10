import { RokuClient, Keys, discover, discoverAll } from '..';

describe('index', () => {
  it('should export the expected interfaces', () => {
    expect(RokuClient).toBeDefined();
    expect(Keys).toBeDefined();
    expect(discover).toBeDefined();
    expect(discoverAll).toBeDefined();
  });
});
