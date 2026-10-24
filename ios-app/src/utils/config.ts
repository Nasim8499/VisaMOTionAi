import Config from 'react-native-config';
import { AppConfig } from '../types';

const defaultConfig: AppConfig = {
  appName: 'VisaMOTionAi',
  appVersion: '1.0.0',
  appDescription: 'Mistral AI powered chat assistant for iOS',
  webviewUrl: 'https://app.nextchat.club',
  enableCamera: true,
  enableFilePicker: true,
  enableShare: true,
  enableNotifications: true,
  enableBiometricAuth: false,
  onesignalAppId: '',
  deepLinkScheme: 'visamotionai',
};

export const getConfig = (): AppConfig => {
  return {
    ...defaultConfig,
    appName: Config.APP_NAME || defaultConfig.appName,
    appVersion: Config.APP_VERSION || defaultConfig.appVersion,
    appDescription: Config.APP_DESCRIPTION || defaultConfig.appDescription,
    webviewUrl: Config.WEBVIEW_URL || defaultConfig.webviewUrl,
    enableCamera: Config.ENABLE_CAMERA === 'true' || defaultConfig.enableCamera,
    enableFilePicker: Config.ENABLE_FILE_PICKER === 'true' || defaultConfig.enableFilePicker,
    enableShare: Config.ENABLE_SHARE === 'true' || defaultConfig.enableShare,
    enableNotifications: Config.ENABLE_NOTIFICATIONS === 'true' || defaultConfig.enableNotifications,
    enableBiometricAuth: Config.ENABLE_BIOMETRIC_AUTH === 'true' || defaultConfig.enableBiometricAuth,
    onesignalAppId: Config.ONESIGNAL_APP_ID || defaultConfig.onesignalAppId,
    deepLinkScheme: Config.DEEP_LINK_SCHEME || defaultConfig.deepLinkScheme,
  };
};

export const APP_CONFIG = getConfig();
