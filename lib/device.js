
const Im = require('immutable')
const Xml2Json = require('xml2js').parseString
const Req = require('superagent')

module.exports = function(deviceIp) {

  const Endpoints = Im.Map({
    apps: `${ip()}/query/apps`,
    activeApp: `${ip()}/query/active-app`
  })

  return {
    ip,
    apps,
    activeApp
  }

  function ip() {
    return String(deviceIp)
  }

  function apps() {
    return new Promise((resolve, reject) => {
      Req
        .get(Endpoints.get('apps'))
        .end((err, res) => {
          if (err) { return reject(err) }

          xml(res.text, reject, json => {

            // tidy up json data
            let apps = json.apps.app.map(app => {
              return Im.Map({
                id: app.$.id,
                name: app._,
                type: app.$.type,
                version: app.$.version
              })
            })

            resolve(Im.List(apps))
          })
        })
    })
  }

  function activeApp() {
    return new Promise((resolve, reject) => {
      Req
        .get(Endpoints.get('activeApp'))
        .end((err, res) => {
          if (err) { return reject(err) }

          // tidy up json
          xml(res.text, reject, json => {
            let activeApp = json['active-app'].app.map(app => {
              return Im.Map({
                id: app.$.id,
                name: app._,
                type: app.$.type,
                version: app.$.version
              })
            })

            resolve(Im.List(activeApp))
          })
        })
    })
  }

  function xml(data, reject, fn) {
    Xml2Json(data, (err, json) => {
      if (err) {
        return reject(err)
      } else {
        return fn(json)
      }
    })
  }

}