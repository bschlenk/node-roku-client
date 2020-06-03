import * as Keys from './keys';
import { RokuClient } from './client';

export default RokuClient;
export * from './client';
export * from './discover';

/**
 * Import `RokuClient` instead.
 * @deprecated
 */
const Client = RokuClient;

/**
 * Import `Keys` instead.
 * @deprecated
 */
const keys = Keys;

export { Keys, Client, keys };
