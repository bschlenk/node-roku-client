
const Im = require('immutable')
const bluebird = require('bluebird')
const Xml2Json = bluebird.promisifyAll(require('xml2js')).parseStringAsync

let Req = require('got')

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
    return Req(Endpoints.get('apps'))
      .then(res => res.text.toString())
      .then(Xml2Json)
      .then(({ apps }) => {
        // tidy up json data
        let installedApps = apps.app.map(a => {
          return Im.Map({
            id: a.$.id,
            name: a._,
            type: a.$.type,
            version: a.$.version
          })
        })
        return Im.List(installedApps)
      })
  }

  function active() {
    return Req(Endpoints.get('activeApp'))
      .then(res => res.text.toString())
      .then(Xml2Json)
      .then(json => {
        // tidy up json data
        let activeApp = json['active-app'].app.map(app => {
          return Im.Map({
            id: app.$.id,
            name: app._,
            type: app.$.type,
            version: app.$.version
          })
        })
        return Im.List(activeApp)
      })
  }

  function info() {
    return Req(Endpoints.get('info'))
      .then(res => res.text.toString())
      .then(Xml2Json)
      .then(json => {
        json = json['device-info']
        flatJson = {}

        Object.entries(json).forEach(([key, value]) => {
          flatJson[key] = value[0]
        });

        const info = Im.Map(flatJson)
        return info
      })
  }

  function icon(appId) {
    return Req.get(`${Endpoints.get('icon')}/${appId}`)
      .then(res => {
        // TODO: cache icons?
        // let stream = require('fs').createWriteStream('tmp.jpeg');
        // stream.write(res.body)
        return res.body
      })
  }

  function launch(appId) {
    return Req
      .post(`${Endpoints.get('launch')}/${appId}`)
      .then(res => {
        return res.status === 200 ? true : false;
      })
  }

  function keyhelper(endpoint, key) {
    return Req.post(`${endpoint}/${key}`)
      .then(res => {
          return res.status === 200 ? true : false;
        })
  }
}
