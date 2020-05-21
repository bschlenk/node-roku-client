# node-roku-client

[![npm][npm]][npm-url]
[![travis][travis]][travis-url]
[![codecov][codecov]][codecov-url]

Discover & control Roku devices from NodeJS.

**requirements:**

- node `10 or higher`
- a Roku device connected to your network
- a router/network that supports UPnP (for ssdp)

## Installation

`$ npm install roku-client`

## Usage

```js
// es2015
import Client, { keys } from 'roku-client';

// commonjs
const { Client, keys } = require('roku-client');

Client.discover(/* timeout, defaults to 10 seconds */)
  .then((client) => {
    console.log(`roku device found at ${client.ip}`);
    return client.apps();
  })
  .then((apps) => {
    apps.forEach((app) => console.log(app));
    // [{ id, name, type, version }, ...]
  })
  .catch((err) => {
    console.error(err.stack);
  });

// Or, if the roku address is already known
const client = new Client('http://192.168.1.17:8060');
client.keypress(keys.VOLUME_UP);
```

## Client.discover()

Invoking `Client.discover()` will return a promise which resolves to a
Client object on success. The Client will be initialized to the address
of the first device to respond. This client object will contain the
methods needed to control a roku device. Commands are sent to the Roku
device via `HTTP` protocol as found on the [docs][1].

If there are multiple Roku devices on the network, `Clint.discoverAll()`
can be called which will wait the full timeout and return a promise that
resolves to an array of clients for all the addresses found.

```js
import Client from 'roku-client';

Client.discoverAll(10).then((clients) => {
  console.log(clients.map((c) => c.ip));
  // ['http://192.168.1.17:8060', 'http://192.168.1.18:8060', ...]
});
```

## API Methods

| **Method Name**                          | **Return Type**                                                             | **Details**                                                                                                      |
| ---------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `ip`                                     | `string`                                                                    | The network ip and port `http://xxx.xxx.xxx.xxx:8060`                                                            |
| `static .discover(timeout?: number)`     | `Promise<Client>`                                                           | Return a promise resolving to a new `Client` object for the first Roku device discovered on the network.         |
| `static .discoverAll(timeout?: number)`  | `Promise<Client[]>`                                                         | Return a promise resolving to a list of `Client` objects corresponding to each roku device found on the network. |
| `.apps()`                                | `Promise<{id: string, name: string, type: string, version: string}[]>`      | List of all apps installed on this device.                                                                       |
| `.active()`                              | `Promise<{id: string, name: string, type: string, version: string}\|null>}` | A single object representing the active app, or null if the home screen is active.                               |
| `.info()`                                | `Promise<Object>`                                                           | A map of this Roku device's properties. Varies from device to device.                                            |
| `.keypress(key: string)`                 | `Promise<void>`                                                             | Send a keypress from [keys.js](lib/keys.js) or a single character to send that letter (e.g. to an input box).    |
| `.keydown(key: string)`                  | `Promise<void>`                                                             | The same as `keypress` but tells the Roku to hold the key down.                                                  |
| `.keyup(key: string)`                    | `Promise<void>`                                                             | The same as `keypress` but tells the Roku to release a key held with `keyup` ( a no-op if the key was not held). |
| `.icon(appId: number)`                   | `Promise<Icon>`                                                             | Fetches the image and returns an object with the fetch response, extension, and mime type.                       |
| `.launch(appId: number)`                 | `Promise<void>`                                                             | Launch the given app by its id.                                                                                  |
| `.launchDtv(channel?: number \| string)` | `Promise<void>`                                                             | Launch the DTV tuner, optionally to a specific channel.                                                          |
| `.text(text: string)`                    | `Promise<void>`                                                             | Send the text string as a series of `keypress` actions.                                                          |
| `.command()`                             | `Commander`                                                                 | Returns a `Commander` instance, which allows for easily chaining key commands to send to the Roku.               |

### Keypress Values

[keys.js](lib/keys.js) contains a list of keypress values understood by
Roku. It can be accessed programmatically:

```js
import { keys } from 'roku-client';

keys.HOME; // 'Home'
keys.LEFT; // 'Left'
```

### Commander

The `Client#command()` method provides a simpler interface over the
keypress and text methods. It allows them to be chained and repeated and
handles all promise chaining internally.

Each key within the [keys.js](lib/keys.js) module is available on the
commander instance in camelcase form. Additionally, a `.text()` method
is available to send text strings. Each key command takes an optional
number to specify the number of times to repeat the command, defaulting
to `1`.

After chaining the desired methods, call `.send()` to send them to the
Roku. `.send()` returns a promise that completes when all buttons have
been pressed, or when the Roku fails to respond to any of the commands.

Commander instances can be saved and reused later as macros.

#### Examples

##### Navigate to a search box and enter text

```js
client
  .command()
  .up()
  .left()
  .select()
  .text('Breaking Bad')
  .enter()
  .send()
  .then(/* commands succeeded */)
  .catch((err) => {
    /* commands failed */
  });
```

##### Turn the volume up by 10

```js
client.command().volumeUp(10).send();
```

##### Conditionally perform a command

```js
client
  .command()
  .exec((cmd) => (goUp ? cmd.up(10) : cmd.down(10)))
  .right()
  .select()
  .send();
```

##### Konami code

```js
client
  .command()
  .up(2)
  .down(2)
  .left()
  .right()
  .left()
  .right()
  .text('ba')
  .enter()
  .send();
```

##### Wait before performing the next command

```js
client.command().enter().wait(1000).text('some text').send();
```

##### Usage as a macro

```js
const volumeUp5 = client.command().volumeUp(5);
const volumeDown5 = client.command().volumeDown(5);

volumeUp5.send();
volumeUp5.send();
```

## Usage in the Browser

I have replaced direct usage of
[node-fetch](https://www.npmjs.com/package/node-fetch) with
[fetch-ponyfill](https://www.npmjs.com/package/fetch-ponyfill), which
should allow `node-roku-client` to be used in the browser. However, I
have not yet tested this, and suspect that `node-ssdp` may cause issues
in the browser. If anything, creating a client directly with the ip
address should work as expected.

## Testing

`$ npm run test`

This will run the linter, unit tests, and coverage.

## References

- [Roku - External Control Service Commands][1]
- [Roku - Keypress Key Values][2]

### Additional Information

Tested on OSX & raspberry pi w/ raspbian jessie, and with Roku TV.

<!-- urls -->

[1]: https://developer.roku.com/docs/developer-program/debugging/external-control-api.md
[2]: https://developer.roku.com/docs/developer-program/debugging/external-control-api.md#keypress-key-values
[npm]: https://img.shields.io/npm/v/roku-client.svg?logo=npm
[npm-url]: https://npmjs.com/package/roku-client
[travis]: https://img.shields.io/travis/bschlenk/node-roku-client/master.svg?logo=travis
[travis-url]: https://travis-ci.org/bschlenk/node-roku-client
[codecov]: https://img.shields.io/codecov/c/github/bschlenk/node-roku-client.svg?logo=codecov
[codecov-url]: https://codecov.io/gh/bschlenk/node-roku-client
