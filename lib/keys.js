/**
 * Create a mapping of keys to make them easier to remember.
 * @see https://sdkdocs.roku.com/display/sdkdoc/External+Control+Guide#ExternalControlGuide-KeypressKeyValues
 */

module.exports = {
  // Standard Keys
  HOME: 'Home',
  REV: 'Rev',
  REVERSE: 'Rev',
  FWD: 'Fwd',
  FORWARD: 'Fwd',
  PLAY: 'Play',
  SELECT: 'Select',
  LEFT: 'Left',
  RIGHT: 'Right',
  DOWN: 'Down',
  UP: 'Up',
  BACK: 'Back',
  INSTANT_REPLAY: 'InstantReplay',
  INFO: 'Info',
  BACKSPACE: 'Backspace',
  SEARCH: 'Search',
  ENTER: 'Enter',

  // For devices that support "Find Remote"
  FIND_REMOTE: 'FindRemote',

  // For Roku TV
  VOLUME_DOWN: 'VolumeDown',
  VOLUME_UP: 'VolumeUp',
  VOLUME_MUTE: 'VolumeMute',

  // For Roku TV while on TV tuner channel
  CHANNEL_UP: 'ChannelUp',
  CHANNEL_DOWN: 'ChannelDown',

  // For Roku TV current input
  INPUT_TUNER: 'InputTuner',
  INPUT_HDMI1: 'InputHDMI1',
  INPUT_HDMI2: 'InputHDMI2',
  INPUT_HDMI3: 'InputHDMI3',
  INPUT_HDMI4: 'InputHDMI4',
  INPUT_AV1: 'InputAV1',

  // For devices that support being turned on/off
  POWER: 'Power'
};

