import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import { migrateLegacyDatabase } from './db/migration'
import packageJson from '../package.json';

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

// Handle Android Hardware Back Button and DIY OTA Updates
  import('@capacitor/core').then(({ Capacitor }) => {
    if (Capacitor.isNativePlatform()) {
      import('capacitor-plugin-safe-area').then(({ SafeArea }) => {
        SafeArea.getSafeAreaInsets().then(({ insets }) => {
          for (const [key, value] of Object.entries(insets)) {
            document.documentElement.style.setProperty(`--safe-area-inset-${key}`, `${value}px`);
          }
        }).catch(console.error);
      }).catch(console.error);

      import('@capgo/capacitor-updater').then(({ CapacitorUpdater }) => {
        CapacitorUpdater.notifyAppReady();

        // DIY Self-Hosted Free OTA Check
        const OTA_URL = "https://flo-lake.vercel.app"; // Fallback to main branch
        
        fetch(`${OTA_URL}/version.json?t=${Date.now()}`)
          .then(res => res.json())
          .then(async data => {
            const currentVersion = packageJson.version;
            
            // Basic SemVer comparison
            const l = currentVersion.split('.').map(Number);
            const r = data.version.split('.').map(Number);
            let isNewer = false;
            for (let i = 0; i < Math.max(l.length, r.length); i++) {
              if ((r[i] || 0) > (l[i] || 0)) { isNewer = true; break; }
              if ((r[i] || 0) < (l[i] || 0)) { break; }
            }

            if (isNewer) {
              console.log(`Downloading OTA update ${data.version}...`);
              const bundle = await CapacitorUpdater.download({
                url: `${OTA_URL}/update.zip`,
                version: data.version
              });
              await CapacitorUpdater.set(bundle); // Reloads the app instantly
            }
          })
          .catch(err => console.error("OTA Check Failed:", err));
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
