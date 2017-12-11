
'use strict';

const bluebird = require('bluebird');
const xml2Json = bluebird.promisifyAll(require('xml2js')).parseStringAsync;
const req = require('got');

module.exports = function (deviceIp) {
  const endpoints = {
    path: deviceIp,
    apps: `${deviceIp}/query/apps`,
    activeApp: `${deviceIp}/query/active-app`,
    info: `${deviceIp}/query/device-info`,
    keypress: `${deviceIp}/keypress`,
    keydown: `${deviceIp}/keydown`,
    keyup: `${deviceIp}/keyup`,
    icon: `${deviceIp}/query/icon`,
    launch: `${deviceIp}/launch`
  };

  endpoints.get = key => endpoints[key];
  Object.freeze(endpoints);

  const ip = () => endpoints.get('path');

  const apps = () => req(endpoints.get('apps'))
    .then(res => res.body.toString())
    .then(xml2Json)
    .then(({ apps }) => {
      // Tidy up json data
      return apps.app.map(a => {
        return {
          id: a.$.id,
          name: a._,
          type: a.$.type,
          version: a.$.version
        };
      });
    });

  const active = () => req(endpoints.get('activeApp'))
    .then(res => res.body.toString())
    .then(xml2Json)
    .then(json => {
      // Tidy up json data
      return json['active-app'].app.map(app => {
        // If no app is currently active, a single field is returned without
        // any properties
        if (!app.$ || !app.$.id) {
          return null;
        }
        return {
          id: app.$.id,
          name: app._,
          type: app.$.type,
          version: app.$.version
        };
      }).filter(app => app !== null);
    });

  const activeApp = () => {
    return active().then(active => {
      return active.length === 0 ? null : active[0];
    });
  };

  const info = () => req(endpoints.get('info'))
    .then(res => res.body.toString())
    .then(xml2Json)
    .then(json => {
      const flatJson = {};
      json = json['device-info'];

      Object.entries(json).forEach(([key, value]) => {
        flatJson[key] = value[0];
      });

      return flatJson;
    });

  const icon = appId => req.get(`${endpoints.get('icon')}/${appId}`)
    .then(res => res.body);

  const launch = appId => req.post(`${endpoints.get('launch')}/${appId}`)
    .then(res => res.status === 200);

  const keyhelper = endpoint => key => req.post(`${endpoint}/${key}`)
    .then(res => res.status === 200);

  return {
    ip,
    apps,
    active,
    activeApp,
    info,
    icon,
    launch,
    keypress: keyhelper(endpoints.get('keypress')),
    keydown: keyhelper(endpoints.get('keydown')),
    keyup: keyhelper(endpoints.get('keyup'))
  };
};
