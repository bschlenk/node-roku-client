import * as fs from 'fs';
import { promisify } from 'es6-promisify';
import { parseString } from 'xml2js';
import fetch, { Response } from 'node-fetch';
import * as tmp from 'tmp';
import reduce = require('lodash.reduce');
import camelcase = require('lodash.camelcase');
import _debug  = require('debug');
import { discover, discoverAll } from './discover';
import Commander from './commander';

const debug = _debug('roku-client:client');

const parseStringAsync = promisify(parseString) as (val: string) => Promise<any>;

// TODO: make this an interface with the possible values
/** The keys that can exist in a roku device info object. */
export type DeviceInfo = Record<string, string>;

/** The ids used by roku to identify an app. */
export type AppId = number | string;

/**
 * The properties associated with a Roku app.
 */
export interface App {
  /** The id, used within the api. */
  id: string;
  /** The display name of the app. */
  name: string;
  /** The app type (channel, application, etc). */
  type: string;
  /** The app version. */
  version: string;
}

/**
 * Return a promise of the parsed fetch response xml.
 * @param res A fetch response object.
 */
function parseXML(res: Response): Promise<any> {
  if (!res.ok) {
    throw new Error(`Request failed: ${res.statusText}`);
  }
  return res.text()
    .then(parseStringAsync);
}

/**
 * Convert the xml version of a roku app
 * to a cleaned up js version.
 */
function appXMLToJS(app: any): App {
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
   * Return a promise resolving to a new `Client` object for the first Roku
   * device discovered on the network. This method resolves to a single
   * `Client` object.
   * @param timeout The time in ms to wait before giving up.
   * @return A promise resolving to a `Client` object.
   */
  static discover(timeout?: number): Promise<Client> {
    return discover(timeout).then(ip => new Client(ip));
  }

  /**
   * Return a promise resolving to a list of `Client` objects corresponding to
   * each roku device found on the network. Check the client's ip member to see
   * which device the client corresponds to.
   * @param timeout The time in ms to wait before giving up.
   * @return A promise resolving to a list of `Client` objects.
   */
  static discoverAll(timeout?: number): Promise<Client[]> {
    return discoverAll(timeout).then(ips => ips.map(ip => new Client(ip)));
  }

  /**
   * Construct a new `Client` object with the given address.
   * @param ip The address of the Roku device on the network.
   */
  constructor(readonly ip: string) {}

  /**
   * Get a list of apps installed on this device.
   * @see {@link https://sdkdocs.roku.com/display/sdkdoc/External+Control+API#ExternalControlAPI-query/apps}
   */
  apps(): Promise<App[]> {
    const endpoint = `${this.ip}/query/apps`;
    debug(`GET ${endpoint}`);
    return fetch(endpoint)
      .then(parseXML)
      .then(({ apps }) => apps.app.map(appXMLToJS));
  }

  /**
   * Get the active app, or null if the home screen is displayed.
   * @see {@link https://sdkdocs.roku.com/display/sdkdoc/External+Control+API#ExternalControlAPI-query/active-app}
   */
  active(): Promise<App | null> {
    const endpoint = `${this.ip}/query/active-app`;
    debug(`GET ${endpoint}`);
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
   * All keys are coerced to camelcase for easier access, so user-device-name
   * becomes userDeviceName, etc.
   * @see {@link https://sdkdocs.roku.com/display/sdkdoc/External+Control+API#ExternalControlAPI-query/device-info}
   */
  info(): Promise<DeviceInfo> {
    const endpoint = `${this.ip}/query/device-info`;
    debug(`GET ${endpoint}`);
    return fetch(endpoint)
      .then(parseXML)
      .then(data => reduce(
        data['device-info'],
        (result, [value], key) => ({
          ...result,
          [camelcase(key)]: value,
        }),
        {},
      ));
  }

  /**
   * Download the given app's icon to the tmp directory and return that location.
   * @see {@link https://sdkdocs.roku.com/display/sdkdoc/External+Control+API#ExternalControlAPI-query/icon/appID}
   * @param appId The app id to get the icon of.
   *     Should be the id from the id field of the app.
   * @return The temporary path to the image.
   */
  icon(appId: AppId): Promise<string> {
    const endpoint = `${this.ip}/query/icon/${appId}`;
    debug(`GET ${endpoint}`);
    return fetch(endpoint)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch icon for app ${appId}: ${res.statusText}`);
        }

        return new Promise((resolve, reject) => {
          const type = res.headers.get('content-type');
          let ext = 'img';
          if (type) {
            const match = /image\/(.*)/.exec(type);
            if (match) {
              ext = match[1];
            }
          }
          tmp.file({ keep: true, postfix: `.${ext}` }, (err, path, fd) => {
            if (err) {
              reject(err);
              return;
            }
            const dest = fs.createWriteStream('', { fd });
            res.body.pipe(dest);
            resolve(path);
          });
        });
      }) as Promise<string>;
  }

  /**
   * Launch the given `appId`.
   * @see {@link https://sdkdocs.roku.com/display/sdkdoc/External+Control+API#ExternalControlAPI-launch/appID}
   * @param appId The id of the app to launch.
   * @return A void promise which resolves when the app is launched.
   */
  launch(appId: AppId): Promise<void> {
    const endpoint = `${this.ip}/launch/${appId}`;
    debug(`POST ${endpoint}`);
    return fetch(endpoint, { method: 'POST' })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to call ${endpoint}: ${res.statusText}`);
        }
      });
  }

  /**
   * Helper used by all keypress methods. Converts single characters
   * to `Lit_` commands to send the letter to the Roku.
   * @see {@link https://sdkdocs.roku.com/display/sdkdoc/External+Control+API#ExternalControlAPI-KeypressKeyValues}
   * @param func The name of the Roku endpoint function.
   * @param key The key to press.
   */
  private keyhelper(func: string, key: string): Promise<void> {
    // if a single key is sent, treat it as a letter
    const keyCmd = (key.length === 1) ? `Lit_${encodeURIComponent(key)}` : key;
    const endpoint = `${this.ip}/${func}/${keyCmd}`;
    debug(`POST ${endpoint}`);
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
   * @param key A key from the keys module.
   * @return A promise which resolves when the keypress has completed.
   */
  keypress(key: string): Promise<void> {
    return this.keyhelper('keypress', key);
  }

  /**
   * Equivalent to pressing and holding the remote control key given.
   * @see {@link https://sdkdocs.roku.com/display/sdkdoc/External+Control+API#ExternalControlAPI-keydown/key}
   * @param key A key from the keys module.
   * @return A promise which resolves when the keydown has completed.
   */
  keydown(key: string): Promise<void> {
    return this.keyhelper('keydown', key);
  }

  /**
   * Equivalent to releasing the remote control key given. Only makes sense
   * if `keydown` was already called for the same key.
   * @see {@link https://sdkdocs.roku.com/display/sdkdoc/External+Control+API#ExternalControlAPI-keyup/key}
   * @param key A key from the keys module.
   * @return A promise which resolves when the keyup has completed.
   */
  keyup(key: string): Promise<void> {
    return this.keyhelper('keyup', key);
  }

  /**
   * Send the given string to the Roku device.
   * A shorthand for calling `keypress` for each letter in the given string.
   * @see {@link https://sdkdocs.roku.com/display/sdkdoc/External+Control+API#ExternalControlAPI-KeypressKeyValues}
   * @param text The message to send.
   * @return A promise which resolves when the text has successfully been sent.
   */
  text(text: string): Promise<void> {
    return reduce(
      text,
      (promise, letter) => promise.then(() => this.keypress(letter)),
      Promise.resolve(),
    );
  }

  /**
   * Chain multiple remote commands together in one convenient api.
   * Each value in the `keys` module is available as a command in
   * camelcase form, and can take an optional number to indicate how many
   * times the button should be pressed. A `text` method is also available
   * to send a full string. After composing the command, `send` should
   * be called to perform the scripted commands. The result of calling
   * `.command()` can be stored in a variable and modified before calling send.
   * Additional calls to send are essentially no-ops, so the returned command
   * object should not be reused.
   *
   * @example
   * client.command()
   *     .volumeUp(10)
   *     .up(2)
   *     .select()
   *     .text('Breaking Bad')
   *     .enter()
   *     .send();
   *
   * @return A commander instance.
   */
  command(): Commander {
    return new Commander(this);
  }
}
