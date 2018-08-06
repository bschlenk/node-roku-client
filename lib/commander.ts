import reduce = require('lodash.reduce');
import values = require('lodash.values');
import * as keys from './keys';

interface KeyCommand {
  command: string;
  name: string;
}

type Client = import('./client').default;
type ClientInterface<T extends Record<string, KeyCommand>> =
    { [N in T[keyof T]['name']]: (count?: number) => Commander };
type KeyNameInterface<T extends Record<string, KeyCommand>> =
    { [N in T[keyof T]['command']]: any };
type KeyName = keyof KeyNameInterface<typeof keys>;

/**
 * A command is a tuple of the string command and whether the command
 * is simply text.
 */
type Command = [string, boolean];

export default interface Commander extends ClientInterface<typeof keys> {}

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
   * camelcase method for convenience.
   * @param key The key to press, from the `keys` module.
   * @param count The number of times to press the key.
   */
  keypress(key: KeyName | KeyCommand, count: number = 1): Commander {
    const command = typeof key === 'string'
      ? key : key.command;
    for (let i = 0; i < count; i += 1) {
      this.commands.push([command, false]);
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
values(keys).forEach((key) => {
  (Commander.prototype as any)[key.name] = function (count = 1) {
    return this.keypress(key.command, count);
  };
});
