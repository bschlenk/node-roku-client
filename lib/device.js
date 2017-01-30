
'use strict';

const im = require('immutable');
const bluebird = require('bluebird');
const xml2Json = bluebird.promisifyAll(require('xml2js')).parseStringAsync;

let req = require('got');

module.exports = function (deviceIp, mockReq) {
  if (mockReq) {
    req = mockReq;
  }

  const endpoints = im.Map({
    path: deviceIp,
    apps: `${deviceIp}/query/apps`,
    activeApp: `${deviceIp}/query/active-app`,
    info: `${deviceIp}/query/device-info`,
    keypress: `${deviceIp}/keypress`,
    keydown: `${deviceIp}/keydown`,
    keyup: `${deviceIp}/keyup`,
    icon: `${deviceIp}/query/icon`,
    launch: `${deviceIp}/launch`
  });

  const ip = () => endpoints.get('path');

  const apps = () => req(endpoints.get('apps'))
    .then(res => res.text.toString())
    .then(xml2Json)
    .then(({ apps }) => {
      // tidy up json data
      let installedApps = apps.app.map(a => {
        return im.Map({
          id: a.$.id,
          name: a._,
          type: a.$.type,
          version: a.$.version
        });
      });
      return im.List(installedApps);
    });

  const active = () => req(endpoints.get('activeApp'))
    .then(res => res.text.toString())
    .then(xml2Json)
    .then(json => {
      // tidy up json data
      let activeApp = json['active-app'].app.map(app => {
        return im.Map({
          id: app.$.id,
          name: app._,
          type: app.$.type,
          version: app.$.version
        });
      });
      return im.List(activeApp);
    });

  const info = () => req(endpoints.get('info'))
    .then(res => res.text.toString())
    .then(xml2Json)
    .then(json => {
      let flatJson = {};
      json = json['device-info'];

      Object.entries(json).forEach(([key, value]) => {
        flatJson[key] = value[0];
      });

      const info = im.Map(flatJson);
      return info;
    });

  const icon = appId => req.get(`${endpoints.get('icon')}/${appId}`)
    .then(res => {
      return res.body;
    });

  const launch = appId => req.post(`${endpoints.get('launch')}/${appId}`)
    .then(res => {
      return res.status === 200;
    });

  const keyhelper = (endpoint, key) => () => req.post(`${endpoint}/${key}`)
    .then(res => {
      return res.status === 200;
    });

  return {
    ip,
    apps,
    active,
    info,
    icon,
    launch,
    keypress: keyhelper(endpoints.get('keypress')),
    keydown: keyhelper(endpoints.get('keydown')),
    keyup: keyhelper(endpoints.get('keyup'))
  };
};
