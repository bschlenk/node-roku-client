import camelcase = require('lodash.camelcase');
import reduce = require('lodash.reduce');
import forOwn = require('lodash.forown');
import * as keys from './keys';

export interface Client {
  text(text: string): Promise<void>;
  keypress(key: string): Promise<void>;
}

/**
 * A command is a tuple of the string command and whether the command
 * is simply text.
 */
type Command = [string, boolean];

export default class Commander {
  private commands: Command[] = [];

  constructor(private readonly client: Client) {}

  /**
   * Send the given string to the Roku device.
   * @param text The string to send.
   * @return This `Commander` instance for chaining.
   */
  text(text: string): Commander {
    this.commands.push([text, true]);
    return this;
  }

  /**
   * Press the given key `count` times. Useful if the keys to press
   * are unknown at coding time. Each key is also available as a
   * camelcased method for convenience.
   * @param key The key to press, from the `keys` module.
   * @param count The number of times to press the key.
   */
  keypress(key: string, count: number = 1): Commander {
    for (let i = 0; i < count; i += 1) {
      this.commands.push([key, false]);
    }
    return this;
  }

  /**
   * Send all of the configured commands to the Roku.
   */
  send(): Promise<void> {
    return reduce(
      // clean up the commands list while also returning it
      this.commands.splice(0, this.commands.length),
      (promise, [command, isText]) => (isText
        ? promise.then(() => this.client.text(command))
        : promise.then(() => this.client.keypress(command))),
      Promise.resolve(),
    );
  }
}

// add all keys as methods to Commander
forOwn(keys, (key, name) => {
  (Commander.prototype as any)[camelcase(name)] = function (count = 1) {
    return this.keypress(key, count);
  };
});
