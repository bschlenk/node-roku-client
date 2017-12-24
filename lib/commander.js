import camelcase from 'lodash.camelcase';
import reduce from 'lodash.reduce';
import forOwn from 'lodash.forown';
import * as keys from './keys';

export default class Commander {
  constructor(client) {
    this.client = client;
    this.commands = [];
  }

  /**
   * Send the given string to the Roku device.
   * @param {string} text The string to send.
   * @return {Commander} This `Commander` instance for chaining.
   */
  text(text) {
    this.commands.push([text, true]);
    return this;
  }

  /**
   * Press the given key `count` times. Useful if the keys to press
   * are unknown at coding time. Each key is also available as a
   * camelcased method for convenience.
   * @param {string} key The key to press, from the `keys` module.
   * @param {number} count The number of times to press the key.
   */
  keypress(key, count = 1) {
    for (let i = 0; i < count; i += 1) {
      this.commands.push([key, false]);
    }
    return this;
  }

  /**
   * Send all of the configured commands to the Roku.
   * @return {Promise<null>}
   */
  send() {
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
  // eslint-disable-next-line func-names
  Commander.prototype[camelcase(name)] = function (count = 1) {
    return this.keypress(key, count);
  };
});
