import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import { migrateLegacyDatabase } from './db/migration'

async function init() {
  try {
    await migrateLegacyDatabase();
  } catch (err) {
    console.error("Migration error:", err);
  }
  
  // Prevent default context menu to make app feel native
  document.addEventListener('contextmenu', event => {
    // allow context menu on inputs if user wants to paste
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    event.preventDefault();
  });
  
  // Handle Android Hardware Back Button and OTA Updates
  import('@capacitor/core').then(({ Capacitor }) => {
    if (Capacitor.isNativePlatform()) {
      // Notify Capgo OTA updater that the bundle loaded successfully
      import('@capgo/capacitor-updater').then(({ CapacitorUpdater }) => {
        CapacitorUpdater.notifyAppReady();
      }).catch(console.error);

      import('@capacitor/app').then(({ App }) => {
        App.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            App.exitApp();
          } else {
            window.history.back();
          }
        });
      });
      
      import('@capacitor/splash-screen').then(({ SplashScreen }) => {
        // slight delay to ensure dom is painted
        setTimeout(() => {
          SplashScreen.hide();
        }, 100);
      });
    }
  });

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

init();
