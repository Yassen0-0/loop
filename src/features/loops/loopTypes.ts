export type LoopCadence = 'daily' | 'weekly';
export type LoopImpact = 'high' | 'medium' | 'low';
export type LoopTodayStatus = 'done' | 'failed' | 'pending';

export type LoopHistoryEntry = {
  date: string;
  status: LoopTodayStatus;
};

export type Loop = {
  id: string;
  title: string;
  cadence: LoopCadence;
  color: string;
  history: LoopHistoryEntry[];
  impact: LoopImpact;
  streak: number;
  todayStatus: LoopTodayStatus;
  isDone: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LoopStats = {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  progress: number;
};
