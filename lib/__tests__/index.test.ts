import { describe, expect, it } from 'vitest'

import { discover, discoverAll, Keys, RokuClient } from '../index.js'

describe('index', () => {
  it('should export the expected interfaces', () => {
    expect(RokuClient).toBeDefined()
    expect(Keys).toBeDefined()
    expect(discover).toBeDefined()
    expect(discoverAll).toBeDefined()
  })
})
