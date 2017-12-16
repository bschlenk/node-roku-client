import fs from 'fs';
import promisify from 'es6-promisify';
import { parseString } from 'xml2js';
import fetch from 'node-fetch';
import tmp from 'tmp';
import reduce from 'lodash.reduce';
import discover from './discover';

const parseStringAsync = promisify(parseString);

/**
 * The properties associated with a Roku app.
 * @typedef {Object} App
 * @property {string} id The id, used within the api.
 * @property {string} name The display name of the app.
 * @property {string} type The app type (channel, application, etc).
 * @property {string} version The app version.
 */

/**
 * Return a promise of the parsed fetch response xml.
 * @param {Promise} res A fetch response object.
 * @return {Promise}
 */
function parseXML(res) {
  if (!res.ok) {
    throw new Error(`Request failed: ${res.statusText}`);
  }
  return res.text()
    .then(parseStringAsync);
}

/**
 * Convert the xml version of a roku app
 * to a cleaned up js version.
 * @param {Object} app
 * @return {App}
 */
function appXMLToJS(app) {
  const { _: name } = app;
  const { id, type, version } = app.$;
  return {
    id,
    name,
    type,
    version,
  };
}

/**
 * The Roku client class. Contains methods to talk to a roku device.
 */
export default class Client {
  /**
   * Return a new `Client` object for the first Roku device discovered
   * on the network.
   * @param {number=} timeout The time in ms to wait before giving up.
   * @return {Client} A `Client` object.
   */
  static discover(timeout) {
    return discover(timeout).then(ip => new Client(ip));
  }

  /**
   * Construct a new `Client` object with the given address.
   * @param {string} ip The address of the Roku device on the network.
   */
  constructor(ip) {
    this.ip = ip;
  }

  /**
   * Get a list of apps installed on this device.
   * @see {@link https://sdkdocs.roku.com/display/sdkdoc/External+Control+API#ExternalControlAPI-query/apps}
   * @return {Promise<App[]>}
   */
  apps() {
    const endpoint = `${this.ip}/query/apps`;
    return fetch(endpoint)
      .then(parseXML)
      .then(({ apps }) => apps.app.map(appXMLToJS));
  }

  /**
   * Get the active app, or null if the home screen is displayed.
   * @see {@link https://sdkdocs.roku.com/display/sdkdoc/External+Control+API#ExternalControlAPI-query/active-app}
   * @return {Promise<App|null>}
   */
  active() {
    const endpoint = `${this.ip}/query/active-app`;
    return fetch(endpoint)
      .then(parseXML)
      .then((data) => {
        const { app } = data['active-app'];
        if (app.length !== 1) {
          throw new Error(`expected 1 active app but received ${app.length}: ${app}`);
        }
        const activeApp = app[0];
        // If no app is currently active, a single field is returned without
        // any properties
        if (!activeApp.$ || !activeApp.$.id) {
          return null;
        }
        return appXMLToJS(activeApp);
      });
  }

  /**
   * Get the info of this Roku device. Responses vary between devices.
   * @see {@link https://sdkdocs.roku.com/display/sdkdoc/External+Control+API#ExternalControlAPI-query/device-info}
   * @return {Promise<Object>}
   */
  info() {
    const endpoint = `${this.ip}/query/device-info`;
    return fetch(endpoint)
      .then(parseXML)
      .then(data => reduce(data['device-info'], (result, [value], key) =>
        Object.assign({}, result, { [key]: value }), {}));
  }

  /**
   * Download the given app's icon to the tmp directory and return that location.
   * @see {@link https://sdkdocs.roku.com/display/sdkdoc/External+Control+API#ExternalControlAPI-query/icon/appID}
   * @param {number|string} appId The app id to get the icon of.
   *     Should be the id from the id field of the app.
   * @return {Promise<string>} The temporary path to the image.
   */
  icon(appId) {
    const endpoint = `${this.ip}/query/icon/${appId}`;
    return fetch(endpoint)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch icon for app ${appId}: ${res.statusText}`);
        }

        return new Promise((resolve, reject) => {
          const type = res.headers.get('content-type');
          const [, ext] = /image\/(.*)/.exec(type);
          tmp.file({ keep: true, postfix: `.${ext}` }, (err, path, fd) => {
            if (err) {
              reject(err);
              return;
            }
            const dest = fs.createWriteStream(null, { fd });
            res.body.pipe(dest);
            resolve(path);
          });
        });
      });
  }

  /**
   * Launch the given `appId`.
   * @see {@link https://sdkdocs.roku.com/display/sdkdoc/External+Control+API#ExternalControlAPI-launch/appID}
   * @param {number|string} appId The id of the app to launch.
   * @return {Promise}
   */
  launch(appId) {
    const endpoint = `${this.ip}/launch/${appId}`;
    return fetch(endpoint, { method: 'POST' })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to call ${endpoint}: ${res.statusText}`);
        }
      });
  }

  /**
   * @api private
   */
  keyhelper(func, key) {
    const endpoint = `${this.ip}/${func}/${key}`;
    return fetch(endpoint, { method: 'POST' })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to call ${endpoint}: ${res.statusText}`);
        }
      });
  }

  /**
   * Equivalent to pressing and releasing the remote control key given.
   * @see {@link https://sdkdocs.roku.com/display/sdkdoc/External+Control+API#ExternalControlAPI-keypress/key}
   * @param {string} key A key from the keys module.
   * @return {Promise}
   */
  keypress(key) {
    return this.keyhelper('keypress', key);
  }

  /**
   * Equivalent to pressing and holding the remote control key given.
   * @see {@link https://sdkdocs.roku.com/display/sdkdoc/External+Control+API#ExternalControlAPI-keydown/key}
   * @param {string} key A key from the keys module.
   * @return {Promise}
   */
  keydown(key) {
    return this.keyhelper('keydown', key);
  }

  /**
   * Equivalent to releasing the remote control key given. Only makes sense
   * if `keydown` was already called for the same key.
   * @see {@link https://sdkdocs.roku.com/display/sdkdoc/External+Control+API#ExternalControlAPI-keyup/key}
   * @param {string} key A key from the keys module.
   * @return {Promise}
   */
  keyup(key) {
    return this.keyhelper('keyup', key);
  }
}
