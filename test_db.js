import Dexie from 'dexie';

const db = new Dexie('BuckfloDB');
db.version(9).stores({
  accounts: '++id, type',
  monthSetups: '++id, monthYear, accountId, [accountId+monthYear]',
  transactions: '++id, date, accountId, type, [accountId+date]',
});

async function run() {
  await db.open();
  const accounts = await db.table('accounts').toArray();
  console.log("ACCOUNTS:", accounts);
  const setups = await db.table('monthSetups').toArray();
  console.log("SETUPS:", setups);
  process.exit(0);
}
run();
