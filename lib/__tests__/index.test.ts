import { RokuClient, Keys, Client, keys, discover, discoverAll } from '..';

describe('index', () => {
  it('should export the expected interfaces', () => {
    expect(RokuClient).toBeDefined();
    expect(Keys).toBeDefined();
    expect(Client).toBeDefined();
    expect(keys).toBeDefined();
    expect(discover).toBeDefined();
    expect(discoverAll).toBeDefined();
  });
});
