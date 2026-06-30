import {
  addLoop,
  deleteLoop,
  getLoops,
  seedStarterLoops,
  setLoopTodayStatus,
  updateLoop,
} from '../src/features/loops/loopRepository.web';

const database = { platform: 'web' } as never;
const store = new Map<string, string>();

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    removeItem: (key: string) => store.delete(key),
    setItem: (key: string, value: string) => store.set(key, value),
  },
});

describe('web loop repository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists create, status, update, and delete flows', async () => {
    await seedStarterLoops(database);
    expect(await getLoops(database)).toHaveLength(3);

    await addLoop(database, {
      cadence: 'daily',
      impact: 'high',
      title: 'Ship Loop',
    });

    const afterCreate = await getLoops(database);
    const createdLoop = afterCreate.find((loop) => loop.title === 'Ship Loop');
    expect(createdLoop).toBeDefined();

    await setLoopTodayStatus(database, createdLoop!, 'done');
    const afterDone = await getLoops(database);
    const doneLoop = afterDone.find((loop) => loop.id === createdLoop!.id);
    expect(doneLoop?.todayStatus).toBe('done');
    expect(doneLoop?.history.at(-1)?.status).toBe('done');

    await updateLoop(database, createdLoop!.id, {
      cadence: 'weekly',
      impact: 'medium',
      title: 'Review Loop',
    });
    const afterUpdate = await getLoops(database);
    const updatedLoop = afterUpdate.find((loop) => loop.id === createdLoop!.id);
    expect(updatedLoop?.title).toBe('Review Loop');
    expect(updatedLoop?.cadence).toBe('weekly');

    await deleteLoop(database, createdLoop!.id);
    expect(await getLoops(database)).toHaveLength(3);
  });
});
