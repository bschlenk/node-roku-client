# node-roku-client

[![npm][npm]][npm-url] [![build][build]][build-url]
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
import { RokuClient, Keys } from 'roku-client';

// commonjs
const { RokuClient, Keys } = require('roku-client');

RokuClient.discover(/* timeout, defaults to 10 seconds */)
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
const client = new RokuClient('http://192.168.1.17:8060');
client.keypress(Keys.VOLUME_UP);
```

## RokuClient.discover()

Invoking `RokuClient.discover()` will return a promise which resolves to a
`RokuClient` object on success. The `RokuClient` will be initialized to the
address of the first device to respond. This client object will contain the
methods needed to control a roku device. Commands are sent to the Roku device
via `HTTP` protocol as found on the [docs][1].

If there are multiple Roku devices on the network, `RokuClient.discoverAll()`
can be called which will wait the full timeout and return a promise that
resolves to an array of clients for all the addresses found.

```js
import { RokuClient } from 'roku-client';

RokuClient.discoverAll().then((clients) => {
  console.log(clients.map((c) => c.ip));
  // ['http://192.168.1.17:8060', 'http://192.168.1.18:8060', ...]
});
```

## API Methods

| **Method Name**                              | **Return Type**                                                               | **Details**                                                                                                          |
| -------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `ip`                                         | `string`                                                                      | The network ip and port `http://xxx.xxx.xxx.xxx:8060`                                                                |
| `static .discover(timeout?: number)`         | `Promise<RokuClient>`                                                         | Return a promise resolving to a new `RokuClient` object for the first Roku device discovered on the network.         |
| `static .discoverAll(timeout?: number)`      | `Promise<RokuClient[]>`                                                       | Return a promise resolving to a list of `RokuClient` objects corresponding to each roku device found on the network. |
| `.apps()`                                    | `Promise<{id: string, name: string, type: string, version: string}[]>`        | List of all apps installed on this device.                                                                           |
| `.active()`                                  | `Promise<{id: string, name: string, type: string, version: string} \| null>}` | A single object representing the active app, or null if the home screen is active.                                   |
| `.info()`                                    | `Promise<Object>`                                                             | A map of this Roku device's properties. Varies from device to device. See [device-info.ts] for the full interface.   |
| `.keypress(key: string)`                     | `Promise<void>`                                                               | Send a keypress from [keys.ts] or a single character to send that letter (e.g. to an input box).                     |
| `.keydown(key: string)`                      | `Promise<void>`                                                               | The same as `keypress` but tells the Roku to hold the key down.                                                      |
| `.keyup(key: string)`                        | `Promise<void>`                                                               | The same as `keypress` but tells the Roku to release a key held with `keyup` ( a no-op if the key was not held).     |
| `.icon(appId: number)`                       | `Promise<Icon>`                                                               | Fetches the image and returns an object with the fetch response, extension, and mime type.                           |
| `.search(query: string \| RokuSearchParams)` | `Promise<void>`                                                               | Launch Roku's search interface for the given query.                                                                  |
| `.mediaPlayer()`                             | `Promise<RokuMediaInfo>`                                                      | Fetch the current state of the media player, possibly including elapsed time, duration, and more.                    |
| `.launch(appId: number)`                     | `Promise<void>`                                                               | Launch the given app by its id.                                                                                      |
| `.launchDtv(channel?: number \| string)`     | `Promise<void>`                                                               | Launch the DTV tuner, optionally to a specific channel.                                                              |
| `.text(text: string)`                        | `Promise<void>`                                                               | Send the text string as a series of `keypress` actions.                                                              |
| `.command()`                                 | `Commander`                                                                   | Returns a `Commander` instance, which allows for easily chaining key commands to send to the Roku.                   |

### Keypress Values

[keys.ts] contains a list of keypress values understood by Roku. It can be
accessed programmatically:

```js
import { Keys } from 'roku-client';

Keys.HOME; // 'Home'
Keys.LEFT; // 'Left'
```

### Commander

The `RokuClient#command()` method provides a simpler interface over the keypress
and text methods. It allows them to be chained and repeated and handles all
promise chaining internally.

Each key within the [keys.ts] module is available on the commander instance in
camelcase form. Additionally, a `.text()` method is available to send text
strings. Each key command takes an optional number to specify the number of
times to repeat the command, defaulting to `1`.

After chaining the desired methods, call `.send()` to send them to the Roku.
`.send()` returns a promise that completes when all buttons have been pressed,
or when the Roku fails to respond to any of the commands.

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

I spent some time trying to get this package to work from a browser. Mainly I
was trying to load it from [skypack.dev] so I could write a demo website. I ran
into a few issues - xml2js doesn't work in the browser, so I tried out
isomorphic-xml2js. Browsers also can't send udp packets, so the whole discovery
mechanism is out of the question. I was able to stub that part out with a
"browsers" field in package.json. The final nail in the coffin is that roku
devices don't set CORS headers, so even after getting the library to run,
browsers block the requests. At this point I've decided there isn't any point in
making this library isomorphic. In the future I might replace [fetch-ponyfill]
with something more light weight.

If you have a good reason for this library to work in browsers, let me know by
opening an issue!

## Testing

`$ npm run test`

This will run the linter, unit tests, and coverage.

## References

- [Roku - External Control Service Commands][1]
- [Roku - Keypress Key Values][2]

### Additional Information

Tested on OSX & raspberry pi w/ raspbian jessie, and with Roku TV.

<!-- urls -->

[1]:
  https://developer.roku.com/docs/developer-program/debugging/external-control-api.md
[2]:
  https://developer.roku.com/docs/developer-program/debugging/external-control-api.md#keypress-key-values
[npm]: https://img.shields.io/npm/v/roku-client.svg?logo=npm
[npm-url]: https://npmjs.com/package/roku-client
[build]:
  https://img.shields.io/github/workflow/status/bschlenk/node-roku-client/Node.js%20CI?logo=github
[build-url]:
  https://github.com/bschlenk/node-roku-client/actions?query=workflow%3A%22Node.js+CI%22
[codecov]:
  https://img.shields.io/codecov/c/github/bschlenk/node-roku-client.svg?logo=codecov
[codecov-url]: https://codecov.io/gh/bschlenk/node-roku-client
[keys.ts]: lib/keys.ts
[device-info.ts]:
  https://github.com/bschlenk/node-roku-client/blob/master/lib/device-info.ts
[skypack.dev]: https://www.skypack.dev
[node-fetch]: https://www.npmjs.com/package/node-fetch
[fetch-ponyfill]: https://www.npmjs.com/package/fetch-ponyfill
