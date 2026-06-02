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
  
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

init();
