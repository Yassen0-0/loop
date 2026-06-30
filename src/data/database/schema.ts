export const databaseName = 'loop.db';

export type Migration = {
  version: number;
  sql: string;
};

export const migrations: Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS loops (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        cadence TEXT NOT NULL CHECK (cadence IN ('daily', 'weekly')),
        color TEXT NOT NULL,
        streak INTEGER NOT NULL DEFAULT 0,
        is_done INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS loops_updated_at_idx
        ON loops(updated_at);
    `,
  },
  {
    version: 2,
    sql: `
      ALTER TABLE loops
        ADD COLUMN impact TEXT NOT NULL DEFAULT 'medium'
        CHECK (impact IN ('high', 'medium', 'low'));

      ALTER TABLE loops
        ADD COLUMN today_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (today_status IN ('done', 'failed', 'pending'));

      UPDATE loops
      SET today_status = CASE
        WHEN is_done = 1 THEN 'done'
        ELSE 'pending'
      END;
    `,
  },
  {
    version: 3,
    sql: `
      CREATE TABLE IF NOT EXISTS loop_entries (
        loop_id TEXT NOT NULL,
        entry_date TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('done', 'failed', 'pending')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (loop_id, entry_date),
        FOREIGN KEY (loop_id) REFERENCES loops(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS loop_entries_date_idx
        ON loop_entries(entry_date);
    `,
  },
];
