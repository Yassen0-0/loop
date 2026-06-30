import type { LoopDatabase } from '../../data/database/client';
import type {
  Loop,
  LoopCadence,
  LoopHistoryEntry,
  LoopImpact,
  LoopTodayStatus,
} from './loopTypes';

type LoopRow = {
  id: string;
  title: string;
  cadence: LoopCadence;
  color: string;
  impact: LoopImpact;
  streak: number;
  today_status: LoopTodayStatus;
  is_done: number;
  created_at: string;
  updated_at: string;
};

type LoopEntryRow = {
  entry_date: string;
  loop_id: string;
  status: LoopTodayStatus;
};

const starterLoops = [
  {
    title: 'Morning focus',
    cadence: 'daily',
    color: '#6FA5FF',
    impact: 'high',
    streak: 8,
    todayStatus: 'done',
  },
  {
    title: 'Workout',
    cadence: 'daily',
    color: '#8AD9FF',
    impact: 'medium',
    streak: 3,
    todayStatus: 'pending',
  },
  {
    title: 'Read 20 minutes',
    cadence: 'daily',
    color: '#BFD7FF',
    impact: 'low',
    streak: 12,
    todayStatus: 'failed',
  },
] satisfies {
  title: string;
  cadence: LoopCadence;
  color: string;
  impact: LoopImpact;
  streak: number;
  todayStatus: LoopTodayStatus;
}[];

export async function seedStarterLoops(database: LoopDatabase) {
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM loops;',
  );

  if ((result?.count ?? 0) > 0) {
    await seedStarterLoopHistory(database);
    return;
  }

  const now = new Date().toISOString();

  await database.withTransactionAsync(async () => {
    for (const [index, loop] of starterLoops.entries()) {
      await database.runAsync(
        `
          INSERT INTO loops
            (
              id,
              title,
              cadence,
              color,
              impact,
              streak,
              today_status,
              is_done,
              created_at,
              updated_at
            )
          VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        [
          `starter-${index + 1}`,
          loop.title,
          loop.cadence,
          loop.color,
          loop.impact,
          loop.streak,
          loop.todayStatus,
          loop.todayStatus === 'done' ? 1 : 0,
          now,
          now,
        ],
      );

      await seedLoopHistory(database, `starter-${index + 1}`, loop.todayStatus);
    }
  });
}

export async function getLoops(database: LoopDatabase) {
  const rows = await database.getAllAsync<LoopRow>(`
    SELECT
      id,
      title,
      cadence,
      color,
      impact,
      streak,
      today_status,
      is_done,
      created_at,
      updated_at
    FROM loops
    ORDER BY created_at ASC;
  `);

  const historyRows = await database.getAllAsync<LoopEntryRow>(`
    SELECT
      loop_id,
      entry_date,
      status
    FROM loop_entries
    ORDER BY entry_date ASC;
  `);
  const historyByLoop = historyRows.reduce<Record<string, LoopHistoryEntry[]>>(
    (history, row) => {
      history[row.loop_id] = history[row.loop_id] ?? [];
      history[row.loop_id].push({
        date: row.entry_date,
        status: row.status,
      });

      return history;
    },
    {},
  );

  return rows.map((row) => mapLoopRow(row, historyByLoop[row.id] ?? []));
}

export type AddLoopInput = {
  cadence: LoopCadence;
  impact: LoopImpact;
  title: string;
};

export type UpdateLoopInput = AddLoopInput;

export async function addLoop(database: LoopDatabase, input: AddLoopInput) {
  const now = new Date().toISOString();
  const loopId = `loop-${Date.now()}`;

  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `
        INSERT INTO loops
          (
            id,
            title,
            cadence,
            color,
            impact,
            streak,
            today_status,
            is_done,
            created_at,
            updated_at
          )
        VALUES
          (?, ?, ?, '#6FA5FF', ?, 0, 'pending', 0, ?, ?);
      `,
      [loopId, input.title.trim(), input.cadence, input.impact, now, now],
    );

    await upsertLoopEntry(database, loopId, getTodayKey(), 'pending', now);
  });
}

export async function updateLoop(
  database: LoopDatabase,
  loopId: string,
  input: UpdateLoopInput,
) {
  await database.runAsync(
    `
      UPDATE loops
      SET title = ?, cadence = ?, impact = ?, updated_at = ?
      WHERE id = ?;
    `,
    [
      input.title.trim(),
      input.cadence,
      input.impact,
      new Date().toISOString(),
      loopId,
    ],
  );
}

export async function deleteLoop(database: LoopDatabase, loopId: string) {
  await database.runAsync(
    `
      DELETE FROM loops
      WHERE id = ?;
    `,
    [loopId],
  );
}

export async function setLoopTodayStatus(
  database: LoopDatabase,
  loop: Loop,
  status: LoopTodayStatus,
  date = getTodayKey(),
) {
  const currentStatus =
    loop.history.find((entry) => entry.date === date)?.status ??
    loop.todayStatus;
  const nextStatus = currentStatus === status ? 'pending' : status;
  const wasDone = currentStatus === 'done';
  const willBeDone = nextStatus === 'done';
  const now = new Date().toISOString();
  const isToday = date === getTodayKey();

  await database.withTransactionAsync(async () => {
    if (isToday) {
      await database.runAsync(
        `
          UPDATE loops
          SET today_status = ?, is_done = ?, streak = ?, updated_at = ?
          WHERE id = ?;
        `,
        [
          nextStatus,
          willBeDone ? 1 : 0,
          getNextStreak(loop.streak, wasDone, willBeDone),
          now,
          loop.id,
        ],
      );
    }

    await upsertLoopEntry(database, loop.id, date, nextStatus, now);
  });
}

function getNextStreak(streak: number, wasDone: boolean, willBeDone: boolean) {
  if (wasDone === willBeDone) {
    return streak;
  }

  return willBeDone ? streak + 1 : Math.max(0, streak - 1);
}

async function seedStarterLoopHistory(database: LoopDatabase) {
  const result = await database.getFirstAsync<{ count: number }>(
    `
      SELECT COUNT(*) AS count
      FROM loop_entries
      WHERE loop_id LIKE 'starter-%';
    `,
  );

  if ((result?.count ?? 0) > 0) {
    return;
  }

  await database.withTransactionAsync(async () => {
    for (const [index, loop] of starterLoops.entries()) {
      await seedLoopHistory(database, `starter-${index + 1}`, loop.todayStatus);
    }
  });
}

async function seedLoopHistory(
  database: LoopDatabase,
  loopId: string,
  todayStatus: LoopTodayStatus,
) {
  const now = new Date().toISOString();
  const today = new Date();

  for (let offset = 27; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const status = getSeedStatus(loopId, offset, todayStatus);

    await upsertLoopEntry(database, loopId, getDateKey(date), status, now);
  }
}

function getSeedStatus(
  loopId: string,
  offset: number,
  todayStatus: LoopTodayStatus,
): LoopTodayStatus {
  if (offset === 0) {
    return todayStatus;
  }

  const signature = loopId.charCodeAt(loopId.length - 1) + offset;

  if (signature % 9 === 0) {
    return 'failed';
  }

  if (signature % 5 === 0) {
    return 'pending';
  }

  return 'done';
}

async function upsertLoopEntry(
  database: LoopDatabase,
  loopId: string,
  date: string,
  status: LoopTodayStatus,
  timestamp: string,
) {
  await database.runAsync(
    `
      INSERT INTO loop_entries
        (loop_id, entry_date, status, created_at, updated_at)
      VALUES
        (?, ?, ?, ?, ?)
      ON CONFLICT(loop_id, entry_date)
      DO UPDATE SET
        status = excluded.status,
        updated_at = excluded.updated_at;
    `,
    [loopId, date, status, timestamp, timestamp],
  );
}

function getTodayKey() {
  return getDateKey(new Date());
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function mapLoopRow(row: LoopRow, history: LoopHistoryEntry[]): Loop {
  return {
    id: row.id,
    title: row.title,
    cadence: row.cadence,
    color: row.color,
    history,
    impact: row.impact,
    streak: row.streak,
    todayStatus: row.today_status,
    isDone: row.is_done === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
