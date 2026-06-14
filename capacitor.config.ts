import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.buckflo.app',
  appName: 'buckflo',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      overlaysWebView: true,
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      backgroundColor: "#1f1f1e",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP"
    },
    CapacitorUpdater: {
      autoUpdate: true,
    }
  }
};

export default config;
