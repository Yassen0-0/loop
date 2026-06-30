import * as SQLite from 'expo-sqlite';

import { databaseName, migrations } from './schema';

export type LoopDatabase = SQLite.SQLiteDatabase;

let databasePromise: Promise<LoopDatabase> | null = null;

export function openLoopDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(databaseName).then(
      async (database) => {
        await migrateDatabase(database);
        return database;
      },
    );
  }

  return databasePromise;
}

async function migrateDatabase(database: LoopDatabase) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const current = await database.getFirstAsync<{ version: number | null }>(
    'SELECT MAX(version) AS version FROM migrations;',
  );
  const currentVersion = current?.version ?? 0;

  for (const migration of migrations) {
    if (migration.version <= currentVersion) {
      continue;
    }

    await database.withTransactionAsync(async () => {
      await database.execAsync(migration.sql);
      await database.runAsync(
        'INSERT INTO migrations (version, applied_at) VALUES (?, ?);',
        [migration.version, new Date().toISOString()],
      );
    });
  }
}
