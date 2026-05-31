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
  
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

init();
