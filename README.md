
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
  })
  .catch(err => {
    console.error(err.stack)
  })

```
## getting Started


## Nodeku
invoking `Nodeku` will return a promise and on success it will pass a device module. This module will contain the methods needed to control a roku device. Commands are sent to the Roku device via `HTTP` protocol as found on the [docs][1].

## tests
`$ npm test`


## references
[Roku - External Control Service Commands][1]


<!-- urls -->
[1]: https://sdkdocs.roku.com/display/sdkdoc/External+Control+Guide#ExternalControlGuide-ExternalControlServiceCommands
