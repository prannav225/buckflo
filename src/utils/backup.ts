import { db } from '../db/database';
import { exportDB, importInto } from 'dexie-export-import';

export async function exportDatabase(fileName: string = 'flo_backup.json') {
  const blob = await exportDB(db, { prettyJson: true });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function importDatabase(file: File) {
  // Clear the database entirely first, then import
  await wipeDatabase();
  await importInto(db, file, { clearTablesBeforeImport: true });
}

export async function wipeDatabase() {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      await table.clear();
    }
  });
}
