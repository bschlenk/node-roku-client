# node-roku-client

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
| `.apps()` | `{id: string, name: string, type: string, version: string}[]` |  List of all apps installed on this device |
| `.active()` | `{id: string, name: string, type: string, version: string}\|null` | A single object representing the active app, or null if the home screen is active. |
| `.info()` | `Object` | A map of this Roku device's properties. Varies from device to device. |
| `.keypress(key: string)` | `void` | resolves on success, rejects on error |
| `.keydown(key: string)`| `void` | resolves on success, rejects on error |
| `.keyup(key: string)` | `void` | resolves on success, rejects on error |
| `.icon(appId: number)` | `String` | Saves the image to a temp file and returns the filename. |
| `.launch(appId: number)` | `void` | resolves on success, rejects on error |

### Keypress Values

`keys` contains a list of keypress values understood by Roku. It can be accessed programmatically:

```js
import { keys } from 'roku-client';

keys.HOME // 'Home'
keys.LEFT // 'Left'
```

See [keys.js](lib/keys.js) for a list of all available keys.

## Testing
`$ npm test`

## References
[Roku - External Control Service Commands][1]
[Roku - Keypress Key Values][2]

### Additional Information
Only tested on OSX and with Roku3 device. halp?

<!-- urls -->
[1]: https://sdkdocs.roku.com/display/sdkdoc/External+Control+API
[2]: https://sdkdocs.roku.com/display/sdkdoc/External+Control+API#ExternalControlAPI-KeypressKeyValues
