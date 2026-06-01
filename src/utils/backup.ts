import { db, DEFAULT_CATEGORIES } from '../db/database';
import { exportDB } from 'dexie-export-import';

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
  const text = await file.text();
  const parsed = JSON.parse(text);

  if (parsed.formatName !== 'dexie' || !parsed.data) {
    throw new Error('Invalid backup file format.');
  }

  const { databaseVersion, data: tableRowsArray } = parsed.data;

  if (!tableRowsArray || !Array.isArray(tableRowsArray)) {
    throw new Error('Backup file does not contain table data.');
  }

  // Perform wipe and import inside a single atomic transaction
  const tableNames = db.tables.map(t => t.name);
  await db.transaction('rw', tableNames, async () => {
    // 1. Wipe all active tables
    for (const name of tableNames) {
      await db.table(name).clear();
    }

    // 2. Import tables one by one using bulkPut for key conflict immunity
    for (const tableData of tableRowsArray) {
      const { tableName, rows } = tableData;
      if (db.tables.some(t => t.name === tableName)) {
        const table = db.table(tableName);
        if (rows && rows.length > 0) {
          // Restore native Javascript Date types from Dexie export format
          const processedRows = rows.map((row: any) => {
            const copy = { ...row };
            if (copy.$types) {
              for (const [key, type] of Object.entries(copy.$types)) {
                if (type === 'date' && copy[key] !== undefined && copy[key] !== null) {
                  copy[key] = new Date(copy[key]);
                }
              }
              delete copy.$types;
            }
            return copy;
          });
          await table.bulkPut(processedRows);
        }
      }
    }

    // 3. Apply migrations if importing an older database version
    if (databaseVersion < 9) {
      // Rename accounts
      await db.accounts.where('type').equals('spending').modify({
        type: 'spending',
        name: 'Spending Wallet'
      });
      await db.accounts.where('type').equals('expenditure').modify({
        type: 'spending',
        name: 'Spending Wallet'
      });
      await db.accounts.where('type').equals('savings').modify({
        name: 'Savings Wallet'
      });

      // Add defaults to Profile
      await db.profile.toCollection().modify((profile) => {
        if (profile.watchCategories === undefined) profile.watchCategories = [];
        if (profile.monthlyIncome === undefined) profile.monthlyIncome = null;
        if (profile.savingsNudgeDismissed === undefined) profile.savingsNudgeDismissed = false;
        if (profile.wizardCompleted === undefined) profile.wizardCompleted = true;
        if (profile.notificationsEnabled === undefined) profile.notificationsEnabled = false;
        if (profile.notificationTime === undefined) profile.notificationTime = '20:00';
        if (profile.notificationPermissionAsked === undefined) profile.notificationPermissionAsked = false;
      });
    }

    // 4. Ensure profile record exists if the user has data (accounts or transactions)
    const profileCount = await db.profile.count();
    if (profileCount === 0) {
      const accountsCount = await db.accounts.count();
      const txCount = await db.transactions.count();
      if (accountsCount > 0 || txCount > 0) {
        await db.profile.put({
          id: 1,
          displayName: "Pocket Ledger User",
          currency: "INR",
          currencySymbol: "₹",
          theme: "system",
          createdAt: new Date(),
          updatedAt: new Date(),
          watchCategories: [],
          monthlyIncome: null,
          savingsNudgeDismissed: false,
          wizardCompleted: true,
          notificationsEnabled: false,
          notificationTime: "20:00",
          notificationPermissionAsked: false,
        });
      }
    }

    // 5. Seed default categories if none exist
    const catCount = await db.categories.count();
    if (catCount === 0) {
      const now = Date.now();
      await db.categories.bulkAdd(
        DEFAULT_CATEGORIES.map((c, i) => ({ ...c, createdAt: now + i }))
      );
    }
  });
}

export async function wipeDatabase(seed: boolean = false) {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      await table.clear();
    }
    if (seed) {
      await db.accounts.bulkAdd([
        { name: 'Spending Wallet', type: 'spending', currentBalance: 0 },
        { name: 'Savings Wallet', type: 'savings', currentBalance: 0 },
      ]);
      const now = Date.now();
      await db.categories.bulkAdd(
        DEFAULT_CATEGORIES.map((c, i) => ({ ...c, createdAt: now + i }))
      );
    }
  });
}
