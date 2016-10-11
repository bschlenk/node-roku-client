
const NodeSSDPServer = require('node-ssdp').Server
const Server = new NodeSSDPServer({
  ssdpSig: 'Roku UPnP/1.0 MiniUPnPd/1.4'
})

// Server.addUSN()
// Server.addUSN('urn:roku-com:device:player:1-0')

Server.addUSN('urn:nodeku:test-fixture:aloha');

Server.start()

module.exports = {
  RokuDevice: {
    start: function(){
      Server.start()
    },
    stop: function() {
      Server.stop()
    }
  }
}