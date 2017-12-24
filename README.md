# node-roku-client

[![npm version](https://badge.fury.io/js/roku-client.svg)](https://badge.fury.io/js/roku-client)

Discover Roku devices via `ssdp` and control the device with methods that perform `http` requests to the device.

**requirements:**
  - node `6.0.0 or higher`
  - connected to the same network as the Roku device.
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
    apps.forEach(app => console.log(app));
    // [{ id, name, type, version }, ...]
  })
  .catch(err => {
    console.error(err.stack)
  });

// Or, if the roku address is already known
const client = new Client('http://192.168.1.17:8060');
client.keypress(keys.VOLUME_UP);
```
## Client.discover()
Invoking `Client.discover()` will return a promise which resolves to a Client object on success. The Client will be initialized to the address of the first device to respond. This client object will contain the methods needed to control a roku device. Commands are sent to the Roku device via `HTTP` protocol as found on the [docs][1].

If there are mutiple Roku devices on the network, call `discover` with the wait parameter set to true. It will return a promise that resolves to a list of all addresses found.

```js
import { discover } from 'roku-client';

discover(10, true).then((addresses) => {
  console.log(addresses);
  // ['http://192.168.1.17:8060', 'http://192.168.1.18:8060', ...]
});
```

## API Methods
| **Method Name** | **Return Type** | **Details** |
|---|---|---|
| `ip` | `string` | network ip and port `http://xxx.xxx.xxx.xxx:8060` |
| `.apps()` | `Promise<{id: string, name: string, type: string, version: string}[]>` |  List of all apps installed on this device |
| `.active()` | `Promise<{id: string, name: string, type: string, version: string}\|null>}` | A single object representing the active app, or null if the home screen is active. |
| `.info()` | `Promise<Object>` | A map of this Roku device's properties. Varies from device to device. |
| `.keypress(key: string)` | `Promise<void>` | Send a keypress from [keys.js](lib/keys.js) or a single character to send that letter (e.g. to an input box). |
| `.keydown(key: string)`| `Promise<void>` | The same as `keypress` but tells the Roku to hold the key down. |
| `.keyup(key: string)` | `Promise<void>` | The same as `keyup` but tells the Roku to release a key held with `keyup` ( a no-op if the key was not held). |
| `.icon(appId: number)` | `Promise<string>` | Saves the image to a temp file and returns the filename. |
| `.launch(appId: number)` | `Promise<void>` | resolves on success, rejects on error |
| `.text(text: string)` | `Promise<void>` | Send the text string as a series of `keypress` actions. |
| `.command()` | `Commander` | Returns a `Commander` instance, which allows for easily chaining key commands to send to the Roku. |

### Keypress Values

`keys` contains a list of keypress values understood by Roku. It can be accessed programmatically:

```js
import { keys } from 'roku-client';

keys.HOME // 'Home'
keys.LEFT // 'Left'
```

See [keys.js](lib/keys.js) for a list of all available keys.

### Commander

The `Client#command()` method provides a simpler interface over the keypress and text methods.
It allows them to be chained and repeated and handles all promise chaining internally.

Each key within the [keys.js](lib/keys.js) module is available on the commander
instance in camelcase form. Additionally, a `.text()` method is available to send
text strings. Each key command takes an optional number to specify the number
of times to repeat the command, defaulting to `1`.

After chaining the desired methods, call `.send()` to send them to the Roku. `.send()` returns
a promise that completes when all buttons have been pressed, or when the Roku fails to respond to
any of the commands. A `Commander` instance should not be reused after calling `.send()`.

#### Examples

##### Navigate to a search box and enter text
```js
client.command()
  .up()
  .left()
  .select()
  .text('Breaking Bad')
  .enter()
  .send()
  .then(/* commands succeeded */)
  .catch(err => { /* commands failed */ });
```

##### Turn the volume up by 10
```js
client.command()
  .volumeUp(10)
  .send();
```

##### Conditionally perform a command
```js
let command = client.comand();
if (goUp) {
  command = command.up(10);
} else {
  command = command.down(10);
}
command
  .right()
  .select()
  .send();
```

##### Konami code
```js
client.command()
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

## Testing
`$ npm test`

This will run the linter, unit tests, and coverage.

## References

[Roku - External Control Service Commands][1]<br>
[Roku - Keypress Key Values][2]

### Additional Information

Tested on OSX & raspberry pi w/ raspbian jessie, and with Roku TV.

<!-- urls -->
[1]: https://sdkdocs.roku.com/display/sdkdoc/External+Control+API
[2]: https://sdkdocs.roku.com/display/sdkdoc/External+Control+API#ExternalControlAPI-KeypressKeyValues
