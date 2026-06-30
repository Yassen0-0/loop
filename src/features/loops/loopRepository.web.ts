import type { LoopDatabase } from '../../data/database/client';
import type {
  Loop,
  LoopCadence,
  LoopHistoryEntry,
  LoopImpact,
  LoopTodayStatus,
} from './loopTypes';

export type AddLoopInput = {
  cadence: LoopCadence;
  impact: LoopImpact;
  title: string;
};

export type UpdateLoopInput = AddLoopInput;

type StoredLoop = Loop;

const storageKey = 'loop.habits.v2';

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

export async function seedStarterLoops(_database: LoopDatabase) {
  const loops = readLoops();

  if (loops.length > 0) {
    return;
  }

  const now = new Date().toISOString();

  writeLoops(
    starterLoops.map((loop, index) => ({
      id: `starter-${index + 1}`,
      title: loop.title,
      cadence: loop.cadence,
      color: loop.color,
      history: createSeedHistory(`starter-${index + 1}`, loop.todayStatus),
      impact: loop.impact,
      streak: loop.streak,
      todayStatus: loop.todayStatus,
      isDone: loop.todayStatus === 'done',
      createdAt: now,
      updatedAt: now,
    })),
  );
}

export async function getLoops(_database: LoopDatabase) {
  return readLoops();
}

export async function addLoop(_database: LoopDatabase, input: AddLoopInput) {
  const now = new Date().toISOString();
  const loopId = `loop-${Date.now()}`;
  const loops = readLoops();

  writeLoops([
    ...loops,
    {
      id: loopId,
      title: input.title.trim(),
      cadence: input.cadence,
      color: '#6FA5FF',
      history: [{ date: getTodayKey(), status: 'pending' }],
      impact: input.impact,
      streak: 0,
      todayStatus: 'pending',
      isDone: false,
      createdAt: now,
      updatedAt: now,
    },
  ]);
}

export async function updateLoop(
  _database: LoopDatabase,
  loopId: string,
  input: UpdateLoopInput,
) {
  const now = new Date().toISOString();

  writeLoops(
    readLoops().map((loop) =>
      loop.id === loopId
        ? {
            ...loop,
            title: input.title.trim(),
            cadence: input.cadence,
            impact: input.impact,
            updatedAt: now,
          }
        : loop,
    ),
  );
}

export async function deleteLoop(_database: LoopDatabase, loopId: string) {
  writeLoops(readLoops().filter((loop) => loop.id !== loopId));
}

export async function setLoopTodayStatus(
  _database: LoopDatabase,
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

  writeLoops(
    readLoops().map((storedLoop) =>
      storedLoop.id === loop.id
        ? {
            ...storedLoop,
            history: upsertHistory(storedLoop.history, date, nextStatus),
            isDone: isToday ? willBeDone : storedLoop.isDone,
            streak: isToday
              ? getNextStreak(storedLoop.streak, wasDone, willBeDone)
              : storedLoop.streak,
            todayStatus: isToday ? nextStatus : storedLoop.todayStatus,
            updatedAt: now,
          }
        : storedLoop,
    ),
  );
}

function readLoops(): StoredLoop[] {
  try {
    const rawValue = globalThis.localStorage?.getItem(storageKey);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);

    return Array.isArray(parsedValue) ? parsedValue.map(normalizeLoop) : [];
  } catch {
    return [];
  }
}

function writeLoops(loops: StoredLoop[]) {
  globalThis.localStorage?.setItem(storageKey, JSON.stringify(loops));
}

function normalizeLoop(loop: Partial<StoredLoop>): StoredLoop {
  const now = new Date().toISOString();
  const todayStatus = getValidStatus(loop.todayStatus);

  return {
    id: loop.id ?? `loop-${Date.now()}`,
    title: loop.title ?? 'Untitled habit',
    cadence: loop.cadence === 'weekly' ? 'weekly' : 'daily',
    color: loop.color ?? '#6FA5FF',
    history: Array.isArray(loop.history)
      ? loop.history.map(normalizeHistoryEntry)
      : [{ date: getTodayKey(), status: todayStatus }],
    impact:
      loop.impact === 'high' || loop.impact === 'low' ? loop.impact : 'medium',
    streak: typeof loop.streak === 'number' ? loop.streak : 0,
    todayStatus,
    isDone: todayStatus === 'done',
    createdAt: loop.createdAt ?? now,
    updatedAt: loop.updatedAt ?? now,
  };
}

function normalizeHistoryEntry(entry: Partial<LoopHistoryEntry>) {
  return {
    date: entry.date ?? getTodayKey(),
    status: getValidStatus(entry.status),
  };
}

function getValidStatus(status: unknown): LoopTodayStatus {
  if (status === 'done' || status === 'failed' || status === 'pending') {
    return status;
  }

  return 'pending';
}

function upsertHistory(
  history: LoopHistoryEntry[],
  date: string,
  status: LoopTodayStatus,
) {
  const nextHistory = history.filter((entry) => entry.date !== date);
  nextHistory.push({ date, status });
  nextHistory.sort((first, second) => first.date.localeCompare(second.date));

  return nextHistory;
}

function createSeedHistory(loopId: string, todayStatus: LoopTodayStatus) {
  const today = new Date();

  return Array.from({ length: 28 }, (_, index) => {
    const offset = 27 - index;
    const date = new Date(today);
    date.setDate(today.getDate() - offset);

    return {
      date: getDateKey(date),
      status: getSeedStatus(loopId, offset, todayStatus),
    };
  });
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

function getNextStreak(streak: number, wasDone: boolean, willBeDone: boolean) {
  if (wasDone === willBeDone) {
    return streak;
  }

  return willBeDone ? streak + 1 : Math.max(0, streak - 1);
}

function getTodayKey() {
  return getDateKey(new Date());
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}
