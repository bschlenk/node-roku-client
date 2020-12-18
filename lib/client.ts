import fetchPonyfill from 'fetch-ponyfill';
import _debug from 'debug';
import { parseXml } from './xml';
import { discover, discoverAll } from './discover';
import { Commander } from './commander';
import { getCommand, KeyType } from './keyCommand';
import { RokuDeviceInfo } from './device-info';
import { queryString, QueryStringObj } from './utils';

const { fetch } = fetchPonyfill();

const debug = _debug('roku-client:client');

/** The default port a roku device will use for remote commands. */
export const ROKU_DEFAULT_PORT = 8060;

/** The ids used by roku to identify an app. */
export type RokuAppId = number | string;

/**
 * The properties associated with a Roku app.
 */
export interface RokuApp {
  /** The id, used within the api. */
  id: string;
  /** The display name of the app. */
  name: string;
  /** The app type (menu, tvin, appl, etc). */
  type: string;
  /** The app version. */
  version: string;
}

/**
 * The response from calling the icon method.
 */
export interface RokuIcon {
  /** The mime type of the icon file. */
  type?: string;
  /** The file extension of the icon file. */
  extension?: string;
  /** The fetch response. */
  response: Response;
}

export interface RokuSearchParams {
  keyword?: string;
  title?: string;
  type?: 'movie' | 'tv-show' | 'person' | 'channel' | 'game';
  tmsid?: string;
  season?: number;
  showUnavailable?: boolean;
  matchAny?: boolean;
  provider?: string | number | string[] | number[];
  launch?: boolean;
}

export interface RokuMediaInfo {
  error: boolean;
  state: string;
  plugin?: {
    bandwidth: string;
    id: string;
    name: string;
  };
  format?: {
    audio: string;
    captions: string;
    container: string;
    drm: string;
    video: string;
    videoRes: string;
  };
  buffering?: {
    current: string;
    max: string;
    target: string;
  };
  newStream?: {
    speed: string;
  };
  position?: string;
  duration?: string;
  isLive?: boolean;
  runtime?: string;
  streamSegmentBitrate?: {
    bitrate: string;
    mediaSequence: string;
    segmentType: string;
    time: string;
  };
}

/**
 * Convert the xml version of a roku app
 * to a cleaned up js version.
 */
function appXMLToJS(app: any): RokuApp {
  return { name: app._, ...app.$ };
}

/**
 * The Roku client class. Contains methods to talk to a roku device.
 */
export class RokuClient {
  /**
   * Return a promise resolving to a new `Client` object for the first Roku
   * device discovered on the network. This method resolves to a single
   * `Client` object.
   * @param timeout The time in ms to wait before giving up.
   * @return A promise resolving to a `Client` object.
   */
  static discover(timeout?: number): Promise<RokuClient> {
    return discover(timeout).then((ip) => new RokuClient(ip));
  }

  /**
   * Return a promise resolving to a list of `Client` objects corresponding to
   * each roku device found on the network. Check the client's ip member to see
   * which device the client corresponds to.
   * @param timeout The time in ms to wait before giving up.
   * @return A promise resolving to a list of `Client` objects.
   */
  static discoverAll(timeout?: number): Promise<RokuClient[]> {
    return discoverAll(timeout).then((ips) =>
      ips.map((ip) => new RokuClient(ip)),
    );
  }

  /**
   * Construct a new `Client` object with the given address.
   * @param ip The address of the Roku device on the network. If no port is
   *     given, then the default roku remote port will be used.
   */
  constructor(readonly ip: string) {
    if (!ip.startsWith('http://')) {
      ip = `http://${ip}`;
    }
    // no port at end
    if (!/:\d+$/.test(ip)) {
      ip = `${ip}:${ROKU_DEFAULT_PORT}`;
    }
    this.ip = ip;
  }

  /**
   * Get a list of apps installed on this device.
   * @see {@link https://developer.roku.com/docs/developer-program/debugging/external-control-api.md#queryapps-example}
   */
  async apps(): Promise<RokuApp[]> {
    const { apps } = await this._getXml('query/apps');
    return apps.app.map(appXMLToJS);
  }

  /**
   * Get the active app, or null if the home screen is displayed.
   * @see {@link https://developer.roku.com/docs/developer-program/debugging/external-control-api.md#queryactive-app-examples}
   */
  async active(): Promise<RokuApp | null> {
    const xml = await this._getXml('query/active-app');
    const { app } = xml.activeApp;
    if (Array.isArray(app)) {
      throw new Error(
        `expected 1 active app but received ${app.length}: ${app}`,
      );
    }
    // If no app is active, a single field is returned without any properties
    if (!app.$ || !app.$.id) {
      return null;
    }
    return appXMLToJS(app);
  }

  /**
   * Get the info of this Roku device. Responses vary between devices.
   * All keys are coerced to camelcase for easier access, so user-device-name
   * becomes userDeviceName, etc.
   * @see {@link https://developer.roku.com/docs/developer-program/debugging/external-control-api.md#querydevice-info-example}
   */
  async info(): Promise<RokuDeviceInfo> {
    const xml = await this._getXml('query/device-info');
    return xml.deviceInfo;
  }

  /**
   * Fetch the given icon from the Roku device and return an object containing
   * the image type, extension, and the fetch response. The response can be
   * streamed to a file, turned into a data url, etc.
   * @see {@link https://developer.roku.com/docs/developer-program/debugging/external-control-api.md#queryicon-example}
   * @param appId The app id to get the icon of.
   *     Should be the id from the id field of the app.
   * @return An object containing the fetch response.
   */
  async icon(appId: RokuAppId): Promise<RokuIcon> {
    const response = await this._get(`query/icon/${appId}`);

    const type = response.headers.get('content-type') || undefined;
    let extension = undefined;
    if (type) {
      const match = /image\/(.*)/.exec(type);
      if (match) {
        extension = `.${match[1]}`;
      }
    }

    return { type, extension, response };
  }

  /**
   * Launch the given `appId`.
   * @see {@link https://developer.roku.com/docs/developer-program/debugging/external-control-api.md#launch-examples}
   * @param appId The id of the app to launch.
   * @return A void promise which resolves when the app is launched.
   */
  async launch(appId: RokuAppId): Promise<void> {
    await this._post(`launch/${appId}`);
  }

  /**
   * Launch the DTV tuner, optionally with a channel number.
   * @see {@link https://developer.roku.com/docs/developer-program/debugging/external-control-api.md#launch-parameters-for-the-roku-tv-tuner-app-channel-id-tvinputdtv}
   * @param channel The channel to launch, or leave blank to launch the DTV
   *     ui to the last open channel.
   * @return A promise which resolves when DTV is launched.
   */
  launchDtv(channel?: number | string): Promise<void> {
    const channelQuery = channel ? `?ch=${channel}` : '';
    const appId = `tvinput.dtv${channelQuery}`;
    return this.launch(appId);
  }

  /**
   * Open the Roku search page with the given search params. The query may be a
   * string, in which case it will be used as the `keyword` in the search.
   * Othewise, query should be a `RokuSearchParams` object, allowing for a more
   * customized search.
   * @see {@link https://developer.roku.com/docs/developer-program/debugging/external-control-api.md#search-examples}
   * @param query The search query.
   * @return A promise which resolves when the search is complete.
   */
  async search(query: string | RokuSearchParams): Promise<void> {
    let q: QueryStringObj;
    if (typeof query === 'string') {
      q = { keyword: query };
    } else {
      const { showUnavailable, matchAny, provider, ...rest } = query;
      q = rest as any;

      if (showUnavailable) {
        q['show-unavailable'] = showUnavailable;
      }
      if (matchAny) {
        q['match-any'] = matchAny;
      }
      if (provider) {
        let key = 'provider';
        if (
          (Array.isArray(provider) && typeof provider[0] === 'number') ||
          typeof provider === 'number'
        ) {
          key += '-id';
        }
        q[key] = Array.isArray(provider) ? provider.join(',') : provider;
      }
    }

    await this._post('search/browse', q);
  }

  /**
   * Get the media player info of this Roku device.
   * @see {@link https://developer.roku.com/docs/developer-program/debugging/external-control-api.md#querymedia-player-example}
   */
  async mediaPlayer(): Promise<RokuMediaInfo> {
    const data = await this._getXml('query/media-player');
    const media: any = {};

    for (const [key, value] of Object.entries(data.player)) {
      if (key === '$') {
        Object.assign(media, value);
        continue;
      }
      if ((value as any).$) {
        media[key] = (value as any).$;
      } else {
        media[key] = value;
      }
    }

    return media;
  }

  /**
   * Helper used by all keypress methods. Converts single characters
   * to `Lit_` commands to send the letter to the Roku.
   * @see {@link https://developer.roku.com/docs/developer-program/debugging/external-control-api.md#keypress-key-values}
   * @param func The name of the Roku endpoint function.
   * @param key The key to press.
   */
  private async keyhelper(func: string, key: KeyType): Promise<void> {
    const command = getCommand(key);
    // if a single key is sent, treat it as a letter
    const keyCmd =
      command.length === 1 ? `Lit_${encodeURIComponent(command)}` : command;
    await this._post(`${func}/${keyCmd}`);
  }

  /**
   * Equivalent to pressing and releasing the remote control key given.
   * @see {@link https://developer.roku.com/docs/developer-program/debugging/external-control-api.md#keypress-example}
   * @param key A key from the keys module.
   * @return A promise which resolves when the keypress has completed.
   */
  keypress(key: KeyType): Promise<void> {
    return this.keyhelper('keypress', key);
  }

  /**
   * Equivalent to pressing and holding the remote control key given.
   * @see {@link https://developer.roku.com/docs/developer-program/debugging/external-control-api.md#keyupkeydown-example}
   * @param key A key from the keys module.
   * @return A promise which resolves when the keydown has completed.
   */
  keydown(key: KeyType): Promise<void> {
    return this.keyhelper('keydown', key);
  }

  /**
   * Equivalent to releasing the remote control key given. Only makes sense
   * if `keydown` was already called for the same key.
   * @see {@link https://developer.roku.com/docs/developer-program/debugging/external-control-api.md#keyupkeydown-example}
   * @param key A key from the keys module.
   * @return A promise which resolves when the keyup has completed.
   */
  keyup(key: KeyType): Promise<void> {
    return this.keyhelper('keyup', key);
  }

  /**
   * Send the given string to the Roku device.
   * A shorthand for calling `keypress` for each letter in the given string.
   * @see {@link https://developer.roku.com/docs/developer-program/debugging/external-control-api.md#keypress-key-values}
   * @param text The message to send.
   * @return A promise which resolves when the text has successfully been sent.
   */
  async text(text: string): Promise<void> {
    for (const char of text) {
      await this.keypress(char);
    }
  }

  /**
   * Chain multiple remote commands together in one convenient api.
   * Each value in the `keys` module is available as a command in
   * camelcase form, and can take an optional number to indicate how many
   * times the button should be pressed. A `text` method is also available
   * to send a full string. After composing the command, `send` should
   * be called to perform the scripted commands. The result of calling
   * `.command()` can be stored in a variable and modified before calling send.
   *
   * @example
   * client.command()
   *   .volumeUp(10)
   *   .up(2)
   *   .select()
   *   .text('Breaking Bad')
   *   .enter()
   *   .send();
   *
   * @return A commander instance.
   */
  command(): Commander {
    return new Commander(this);
  }

  private async _get(path: string) {
    const endpoint = `${this.ip}/${path}`;
    debug(`GET ${endpoint}`);
    const res = await fetch(endpoint);
    if (!res.ok) {
      throw new Error(`Failed to GET ${endpoint}: ${res.statusText}`);
    }
    return res;
  }

  private async _getXml(path: string) {
    return this._get(path)
      .then((res) => res.text())
      .then(parseXml);
  }

  private async _post(path: string, query?: QueryStringObj) {
    let endpoint = `${this.ip}/${path}`;
    if (query) {
      endpoint += '?' + queryString(query);
    }
    debug(`POST ${endpoint}`);
    const res = await fetch(endpoint, { method: 'POST' });
    if (!res.ok) {
      throw new Error(`Failed to POST ${endpoint}: ${res.statusText}`);
    }
    return res;
  }
}
