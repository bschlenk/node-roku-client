export interface RokuDeviceInfo {
  advertisingId: string;
  buildNumber: string;
  canUseWifiExtender: boolean;
  clockFormat: string;
  country: string;
  davinciVersion: string;
  defaultDeviceName: string;
  developerEnabled: boolean;
  deviceId: string;
  ethernetMac: string;
  expertPqEnabled: string;
  friendlyDeviceName: string;
  friendlyModelName: string;
  grandcentralVersion: string;
  hasMobileScreensaver: boolean;
  hasPlayOnRoku: boolean;
  hasWifi5GSupport: boolean;
  hasWifiExtender: boolean;
  headphonesConnected: boolean;
  isStick: boolean;
  isTv: boolean;
  keyedDeveloperId: string;
  language: string;
  locale: string;
  modelName: string;
  modelNumber: string;
  modelRegion: string;
  networkName: string;
  networkType: 'wifi' | 'ethernet';
  notificationsEnabled: boolean;
  notificationsFirstUse: boolean;
  panelId: string;
  powerMode: 'Ready' | 'Headless' | 'DisplayOff' | 'PowerOn';
  screenSize: string;
  searchChannelsEnabled: boolean;
  searchEnabled: boolean;
  secureDevice: boolean;
  serialNumber: string;
  softwareBuild: string;
  softwareVersion: string;
  supportUrl: string;
  supportsAudioGuide: boolean;
  supportsEcsMicrophone: boolean;
  supportsEcsTextedit: boolean;
  supportsEthernet: boolean;
  supportsFindRemote: boolean;
  supportsPrivateListening: boolean;
  supportsPrivateListeningDtv: boolean;
  supportsRva: boolean;
  supportsSuspend: boolean;
  supportsWakeOnWlan: boolean;
  supportsWarmStandby: boolean;
  timeZone: string;
  timeZoneAuto: boolean;
  timeZoneName: string;
  timeZoneOffset: string;
  timeZoneTz: string;
  trcVersion: string;
  trcChannelVersion: string;
  tunerType: string;
  udn: string;
  uptime: string;
  userDeviceLocation: string;
  userDeviceName: string;
  vendorName: string;
  voiceSearchEnabled: boolean;
  wifiDriver: string;
  wifiMac: string;
}
