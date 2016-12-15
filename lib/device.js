
const Im = require('immutable')
const Xml2Json = require('xml2js').parseString

let Req = require('superagent')

module.exports = function(deviceIp, MockReq) {

  if (MockReq) {
    Req = MockReq
  }

  const Endpoints = Im.Map({
    path: deviceIp,
    apps: `${deviceIp}/query/apps`,
    activeApp: `${deviceIp}/query/active-app`,
    info: `${deviceIp}/query/device-info`,
    keypress: `${deviceIp}/keypress`,
    keydown: `${deviceIp}/keydown`,
    keyup: `${deviceIp}/keyup`,
    icon: `${deviceIp}/query/icon`,
    launch: `${deviceIp}/launch`
  })

  return {
    ip,
    apps,
    active,
    info,
    icon,
    launch,
    keypress: keyhelper.bind(null, Endpoints.get('keypress')),
    keydown: keyhelper.bind(null, Endpoints.get('keydown')),
    keyup: keyhelper.bind(null, Endpoints.get('keyup')),
  }

  function ip() {
    return Endpoints.get('path')
  }

  function apps() {
    return new Promise((resolve, reject) => {
      return Req
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

            return resolve(Im.List(apps))
          })
        })
    })
  }

  function active() {
    return new Promise((resolve, reject) => {
      return Req
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

            return resolve(Im.List(activeApp))
          })
        })
    })
  }

  function info() {
    return new Promise((resolve, reject) => {
      return Req
        .get(Endpoints.get('info'))
        .end((err, res) => {
          if (err) { return reject(err) }

          xml(res.text, reject, json => {
            json = json['device-info']
            flatJson = {};

            Object.entries(json).forEach(([key, value]) => {
              flatJson[key] = value[0];
            });

            const info = Im.Map(flatJson);
            return resolve(info)
          })
        })
    })
  }

  function icon(appId) {
    return new Promise((resolve, reject) => {
      return Req
        .get(`${Endpoints.get('icon')}/${appId}`)
        .end((err, res) => {
          // TODO: cache icons?
          // let stream = require('fs').createWriteStream('tmp.jpeg');
          // stream.write(res.body)
          resolve(res.body)
        })
    })
  }

  function launch(appId) {
    return new Promise((resolve, reject) => {
      return Req
        .post(`${Endpoints.get('launch')}/${appId}`)
        .end((err, res) => {
          if (err) { return reject(err) }

          if (res.status === 200) { return resolve(true) }
        })
    })
  }

  function keyhelper(endpoint, key) {
    return new Promise((resolve, reject) => {
      return Req
        .post(`${endpoint}/${key}`)
        .end((err, res) => {
          if (err) { return reject(err) }

          if (res.status === 200) { return resolve(true) }
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
