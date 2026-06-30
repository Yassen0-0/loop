import type { Loop, LoopStats } from './loopTypes';

export function getLoopStats(loops: Loop[]): LoopStats {
  const total = loops.length;
  const completed = loops.filter((loop) => loop.todayStatus === 'done').length;
  const failed = loops.filter((loop) => loop.todayStatus === 'failed').length;
  const pending = total - completed - failed;

  return {
    completed,
    failed,
    pending,
    progress: total === 0 ? 0 : completed / total,
    total,
  };
}
