/**
 * Create a mapping of keys to make them easier to remember.
 * @see {@link https://developer.roku.com/docs/developer-program/debugging/external-control-api.md#keypress-key-values}
 */

function key<T extends string, U extends string>(command: T, name: U) {
  return { command, name }
}

// Standard Keys
export const HOME = key('Home', 'home')
export const REV = key('Rev', 'reverse')
export const REVERSE = REV
export const FWD = key('Fwd', 'forward')
export const FORWARD = FWD
export const PLAY = key('Play', 'play')
export const SELECT = key('Select', 'select')
export const LEFT = key('Left', 'left')
export const RIGHT = key('Right', 'right')
export const DOWN = key('Down', 'down')
export const UP = key('Up', 'up')
export const BACK = key('Back', 'back')
export const INSTANT_REPLAY = key('InstantReplay', 'instantReplay')
export const INFO = key('Info', 'info')
export const STAR = key('Info', 'star')
export const OPTIONS = key('Info', 'options')
export const BACKSPACE = key('Backspace', 'backspace')
export const SEARCH = key('Search', 'search')
export const ENTER = key('Enter', 'enter')

// For devices that support "Find Remote"
export const FIND_REMOTE = key('FindRemote', 'findRemote')

// For Roku TV
export const VOLUME_DOWN = key('VolumeDown', 'volumeDown')
export const VOLUME_UP = key('VolumeUp', 'volumeUp')
export const VOLUME_MUTE = key('VolumeMute', 'volumeMute')

// For Roku TV while on TV tuner channel
export const CHANNEL_UP = key('ChannelUp', 'channelUp')
export const CHANNEL_DOWN = key('ChannelDown', 'channelDown')

// For Roku TV current input
export const INPUT_TUNER = key('InputTuner', 'inputTuner')
export const INPUT_HDMI1 = key('InputHDMI1', 'inputHDMI1')
export const INPUT_HDMI2 = key('InputHDMI2', 'inputHDMI2')
export const INPUT_HDMI3 = key('InputHDMI3', 'inputHDMI3')
export const INPUT_HDMI4 = key('InputHDMI4', 'inputHDMI4')
export const INPUT_AV1 = key('InputAV1', 'inputAV1')

// For devices that support being turned on/off
export const POWER = key('Power', 'power')
export const POWER_OFF = key('PowerOff', 'powerOff')
export const POWER_ON = key('PowerOn', 'powerOn')
