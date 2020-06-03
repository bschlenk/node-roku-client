import * as Keys from './keys';
import { getCommand, KeyCommand, KeyName } from './keyCommand';
import type { RokuClient } from './client';

type ClientInterface<T extends Record<string, KeyCommand>> = {
  [N in T[keyof T]['name']]: (count?: number) => Commander;
};

/**
 * A command is a tuple of the string command and whether the command
 * is simply text, and in the case of a wait command, the number of millis to
 * wait for.
 */
type Command = [string, boolean, number?];

const WAIT_COMMAND = '__WAIT';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Commander extends ClientInterface<typeof Keys> {}

export class Commander {
  private commands: Command[] = [];

  constructor(private readonly client: RokuClient) {}

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
  keypress(key: KeyName | KeyCommand, count = 1): Commander {
    const command = getCommand(key);
    for (let i = 0; i < count; i += 1) {
      this.commands.push([command, false]);
    }
    return this;
  }

  /**
   * A convenience method for running commands conditionally. The callback
   * function will be called with the instance of the commander, and will return
   * the current commander instance. This makes it easy to run conditional logic
   * within the chain of commands.
   * @param fn A callback function that accepts the `Commander` instance. It may
   *     call any `Commander` method, or do nothing at all.
   * @return This `Commander` instance for chaining.
   *
   * @example
   * command
   *   .exec(cmd => goUp ? cmd.up(10) : cmd.down(10))
   *   .right()
   *   .select()
   *   .send();
   */
  exec(fn: (commander: Commander) => Commander | null | undefined): Commander {
    fn(this);
    return this;
  }

  /**
   * Wait the given `timeout` time before sending the next command.
   * @param timeout The number of millis to wait.
   * @return This `Commander` instance for chaining.
   */
  wait(timeout: number): Commander {
    this.commands.push([WAIT_COMMAND, false, timeout]);
    return this;
  }

  /**
   * Send all of the configured commands to the Roku.
   */
  send(): Promise<void> {
    return this.commands.reduce(
      (promise, command) => promise.then(() => this.runCommand(command)),
      Promise.resolve(),
    );
  }

  private runCommand([command, isText, timeout = 0]: Command): Promise<void> {
    if (isText) {
      return this.client.text(command);
    }
    if (command === WAIT_COMMAND) {
      return wait(timeout);
    }
    return this.client.keypress(command);
  }
}

// add all keys as methods to Commander
Object.values(Keys).forEach((key) => {
  (Commander.prototype as any)[key.name] = function (count = 1) {
    return this.keypress(key.command, count);
  };
});

function wait(timeout: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}
