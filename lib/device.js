
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
    icon: `${deviceIp}/query/icon`
  })

  return {
    ip,
    apps,
    activeApp,
    info,
    icon,
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

  function activeApp() {
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

            const info = Im.Map({
              'udn': json['udn'][0],
              'serial-number': json['serial-number'][0],
              'device-id': json['device-id'][0],
              'advertising-id': json['advertising-id'][0],
              'vendor-name': json['vendor-name'][0],
              'model-name': json['model-name'][0],
              'model-number': json['model-number'][0],
              'model-region': json['model-region'][0],
              'wifi-mac': json['wifi-mac'][0],
              'ethernet-mac': json['ethernet-mac'][0],
              'network-type': json['network-type'][0],
              'user-device-name': json['user-device-name'][0],
              'software-version': json['software-version'][0],
              'software-build': json['software-build'][0],
              'secure-device': json['secure-device'][0],
              'language': json['language'][0],
              'country': json['country'][0],
              'locale': json['locale'][0],
              'time-zone': json['time-zone'][0],
              'time-zone-offset': json['time-zone-offset'][0],
              'power-mode': json['power-mode'][0],
              'supports-suspend': json['supports-suspend'][0],
              'developer-enabled': json['developer-enabled'][0],
              'keyed-developer-id': json['keyed-developer-id'][0],
              'search-enabled': json['search-enabled'][0],
              'voice-search-enabled': json['voice-search-enabled'][0],
              'notifications-enabled': json['notifications-enabled'][0],
              'notifications-first-use': json['notifications-first-use'][0],
              'headphones-connected': json['headphones-connected'][0]
            })

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