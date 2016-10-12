
# nodeku

Discover Roku devices via `ssdp` and control the device with methods that perform `http` requests to the device.

**requirements:**
  - node `6.0.0 or higher`
  - connected to the same network as the Roku device.
  - a router/network that supports UPnP (for ssdp)

## usage
```javascript

const Nodeku = require('nodeku')

Nodeku()
  .then(device => {
    console.log(`device found at: ${ device.ip() }`)
    // 'xxx.xxx.xxx.xxx:8060'
    return device.apps()
  })
  .then(apps => {
    apps.forEach(app => console.log(app))
    // [{ id, name, type, version }, ...]
  })
  .catch(err => {
    console.error(err.stack)
  })

```
## getting started


## nodeku
invoking `Nodeku` will return a promise and on success it will pass a device module. This module will contain the methods needed to control a roku device. Commands are sent to the Roku device via `HTTP` protocol as found on the [docs][1].

### caveats
This project uses [immutablejs][2] which means all the data structures received through this module will be immutable.


| **method name** | **return type** | **details** |
|---|---|---|
| `.ip()` | `String` | network ip and port `xxx.xxx.xxx.xxx:8060` |
| `.apps()` | `List[{}, ...]` | list of many objects with props: `id, name, type, version` |
| `.activeApp()` | `List[{}]` | list with one object with props `id, name, type, version` |
| `.info()` | `Map{}` | map with *too many(29) props* |

## tests
`$ npm test`


## references
[Roku - External Control Service Commands][1]


<!-- urls -->
[1]: https://sdkdocs.roku.com/display/sdkdoc/External+Control+Guide#ExternalControlGuide-ExternalControlServiceCommands
[2]: http://facebook.github.io/immutable-js/
