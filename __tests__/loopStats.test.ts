import { getLoopStats } from '../src/features/loops/loopStats';
import type { Loop } from '../src/features/loops/loopTypes';

const baseLoop: Loop = {
  id: 'loop-1',
  title: 'Read',
  cadence: 'daily',
  color: '#14B8A6',
  history: [],
  impact: 'high',
  streak: 1,
  todayStatus: 'pending',
  isDone: false,
  createdAt: '2026-06-30T00:00:00.000Z',
  updatedAt: '2026-06-30T00:00:00.000Z',
};

describe('getLoopStats', () => {
  it('returns empty progress when there are no loops', () => {
    expect(getLoopStats([])).toEqual({
      completed: 0,
      failed: 0,
      pending: 0,
      progress: 0,
      total: 0,
    });
  });

  it('calculates completed loops and progress', () => {
    expect(
      getLoopStats([
        { ...baseLoop, id: 'loop-1', isDone: true, todayStatus: 'done' },
        { ...baseLoop, id: 'loop-2', isDone: false, todayStatus: 'failed' },
      ]),
    ).toEqual({
      completed: 1,
      failed: 1,
      pending: 0,
      progress: 0.5,
      total: 2,
    });
  });
});
