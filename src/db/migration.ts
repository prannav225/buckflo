import Dexie from "dexie";
import { db } from "./database";

export async function migrateLegacyDatabase() {
  const legacyDbExists = await Dexie.exists("PocketLedgerDB");
  if (!legacyDbExists) return;

  const legacyDb = new Dexie("PocketLedgerDB");

  try {
    await legacyDb.open();

    const hasTable = (name: string) =>
      legacyDb.tables.some((t) => t.name === name);

    let profileCount = 0;
    let txCount = 0;

    if (hasTable("profile"))
      profileCount = await legacyDb.table("profile").count();
    if (hasTable("transactions"))
      txCount = await legacyDb.table("transactions").count();

    if (profileCount === 0 && txCount === 0) {
      await legacyDb.delete();
      return;
    }

    // Fetch all data BEFORE starting the transaction to avoid TransactionInactiveError
    const dataToMigrate: any = {};
    if (hasTable("accounts"))
      dataToMigrate.accounts = await legacyDb.table("accounts").toArray();
    if (hasTable("monthSetups"))
      dataToMigrate.monthSetups = await legacyDb.table("monthSetups").toArray();
    if (hasTable("transactions"))
      dataToMigrate.transactions = await legacyDb
        .table("transactions")
        .toArray();
    if (hasTable("savingGoals"))
      dataToMigrate.savingGoals = await legacyDb.table("savingGoals").toArray();
    if (hasTable("subscriptions"))
      dataToMigrate.subscriptions = await legacyDb
        .table("subscriptions")
        .toArray();
    if (hasTable("profile"))
      dataToMigrate.profile = await legacyDb.table("profile").toArray();

    // Clear BuckfloDB just in case it has partial data, then copy everything in a single transaction
    await db.transaction(
      "rw",
      [
        db.accounts,
        db.monthSetups,
        db.transactions,
        db.savingGoals,
        db.subscriptions,
        db.profile,
      ],
      async () => {
        await db.accounts.clear();
        await db.monthSetups.clear();
        await db.transactions.clear();
        await db.savingGoals.clear();
        await db.subscriptions.clear();
        await db.profile.clear();

        if (dataToMigrate.accounts?.length > 0)
          await db.accounts.bulkAdd(dataToMigrate.accounts);
        if (dataToMigrate.monthSetups?.length > 0)
          await db.monthSetups.bulkAdd(dataToMigrate.monthSetups);
        if (dataToMigrate.transactions?.length > 0)
          await db.transactions.bulkAdd(dataToMigrate.transactions);
        if (dataToMigrate.savingGoals?.length > 0)
          await db.savingGoals.bulkAdd(dataToMigrate.savingGoals);
        if (dataToMigrate.subscriptions?.length > 0)
          await db.subscriptions.bulkAdd(dataToMigrate.subscriptions);
        if (dataToMigrate.profile?.length > 0)
          await db.profile.bulkAdd(dataToMigrate.profile);
      },
    );

    // If we reach here, migration was fully successful inside the transaction block. Safely delete the old database.
    await legacyDb.delete();
    console.log("Migration from PocketLedgerDB to BuckfloDB successful.");
  } catch (err) {
    console.error("Failed to migrate legacy database:", err);
    // Let the caller know it failed so they don't load into an empty BuckfloDB state
    throw new Error(
      "Database migration failed. Please ensure you have sufficient storage.",
    );
  } finally {
    legacyDb.close();
  }
}
