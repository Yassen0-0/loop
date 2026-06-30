import type { LoopTodayStatus } from '../loops/loopTypes';

export type DailyGoal = {
  id: string;
  status: LoopTodayStatus;
  title: string;
};

export type JournalDay = {
  goals: DailyGoal[];
  note: string;
};

export type PrayerName = 'asr' | 'dhuhr' | 'fajr' | 'isha' | 'maghrib';

export type SunnahPrayer = {
  id: string;
  prayer: PrayerName;
  status: LoopTodayStatus;
  timing: 'after' | 'before';
  title: string;
};

export type ReligiousBook = {
  id: string;
  isDone: boolean;
  progress: number;
  title: string;
};

export type ReligiousYearGoal = {
  id: string;
  progress: number;
  title: string;
};

export type ReligionDay = {
  city: string;
  country: string;
  lessonNote: string;
  lessonStatus: LoopTodayStatus;
  prayers: Record<PrayerName, boolean>;
  quranDone: boolean;
  quranWird: string;
  sunnah: SunnahPrayer[];
};

export type ReligionState = {
  books: ReligiousBook[];
  days: Record<string, ReligionDay>;
  yearlyGoals: ReligiousYearGoal[];
};

export type DailyState = {
  journal: Record<string, JournalDay>;
  religion: ReligionState;
};
