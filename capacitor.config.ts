import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.buckflo.app",
  appName: "Buckflo",
  webDir: "dist",
  plugins: {
    StatusBar: {
      overlaysWebView: true,
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      backgroundColor: "#1f1f1e",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
    },
    CapacitorUpdater: {
      autoUpdate: false,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#d97757",
    },
  },
};

export default config;
