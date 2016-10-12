
const Xml2Json = require('xml2js').parseString
const Req = require('superagent')

module.exports = function(deviceIp) {

  const Endpoints = {
    apps: `${ip()}/query/apps `
  }

  return {
    ip,
    apps
  }

  function ip() {
    return String(deviceIp)
  }

  function apps() {
    return new Promise((resolve, reject) => {
      Req
        .get(Endpoints.apps)
        .end((err, res) => {
          if (err) { return reject(err) }

          Xml2Json(res.text, (err, json) => {
            if (err) { return reject(err) }

            // tidy up json data
            let apps = json.apps.app.map(app => {
              return {
                name: app._,
                id: app.$.id,
                appl: app.$.type,
                version: app.$.version
              }
            })

            resolve(apps)
          })
        })
    })
  }
}