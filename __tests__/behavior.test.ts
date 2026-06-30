import { act, renderHook } from '@testing-library/react-native';
import { createElement, type PropsWithChildren } from 'react';

import {
  addLoop,
  deleteLoop,
  getLoops,
  setLoopTodayStatus,
  updateLoop,
} from '../src/features/loops/loopRepository.web';
import { useDailyStore } from '../src/features/daily/dailyStore';
import {
  AppPreferencesProvider,
  useAppPreferences,
} from '../src/shared/preferences/AppPreferencesProvider';
import { getDateKey } from '../src/shared/date/dateUtils';

const database = { platform: 'web' } as never;

const today = getDateKey();
const yesterday = (() => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return getDateKey(date);
})();

beforeEach(() => {
  localStorage.clear();
});

async function fire(fn: () => void) {
  await act(async () => {
    fn();
  });
}

async function getLoopById(id: string) {
  const loops = await getLoops(database);
  return loops.find((loop) => loop.id === id)!;
}

describe('habits flows (web repository)', () => {
  it('adds a habit, marks done, then failed, then pending', async () => {
    await addLoop(database, {
      cadence: 'daily',
      impact: 'high',
      title: 'Meditate',
    });

    let habit = await getLoopById(
      (await getLoops(database)).find((l) => l.title === 'Meditate')!.id,
    );
    expect(habit.todayStatus).toBe('pending');

    await setLoopTodayStatus(database, habit, 'done');
    expect((await getLoopById(habit.id)).todayStatus).toBe('done');

    await setLoopTodayStatus(database, await getLoopById(habit.id), 'failed');
    expect((await getLoopById(habit.id)).todayStatus).toBe('failed');

    // toggling the same status again returns to pending
    await setLoopTodayStatus(database, await getLoopById(habit.id), 'failed');
    expect((await getLoopById(habit.id)).todayStatus).toBe('pending');
  });

  it('keeps per-day status isolated when the date changes', async () => {
    await addLoop(database, {
      cadence: 'daily',
      impact: 'medium',
      title: 'Run',
    });
    const habit = await getLoopById(
      (await getLoops(database)).find((l) => l.title === 'Run')!.id,
    );

    await setLoopTodayStatus(database, habit, 'done', yesterday);
    await setLoopTodayStatus(database, habit, 'failed', today);

    const stored = await getLoopById(habit.id);
    expect(stored.todayStatus).toBe('failed');
    expect(
      stored.history.find((entry) => entry.date === yesterday)?.status,
    ).toBe('done');
    expect(stored.history.find((entry) => entry.date === today)?.status).toBe(
      'failed',
    );
  });

  it('edits and then deletes a habit', async () => {
    await addLoop(database, {
      cadence: 'daily',
      impact: 'low',
      title: 'Read',
    });
    const habit = await getLoopById(
      (await getLoops(database)).find((l) => l.title === 'Read')!.id,
    );

    await updateLoop(database, habit.id, {
      cadence: 'weekly',
      impact: 'high',
      title: 'Read more',
    });
    const updated = await getLoopById(habit.id);
    expect(updated.title).toBe('Read more');
    expect(updated.cadence).toBe('weekly');
    expect(updated.impact).toBe('high');

    await deleteLoop(database, habit.id);
    const afterDelete = await getLoops(database);
    expect(afterDelete.find((loop) => loop.id === habit.id)).toBeUndefined();
  });

  it('does not get stuck on loading — repository resolves immediately', async () => {
    const loops = await getLoops(database);
    expect(Array.isArray(loops)).toBe(true);
  });
});

describe('journal & goals flows (daily store)', () => {
  it('writes a note that persists per date', async () => {
    const { result } = await renderHook(() => useDailyStore());

    await fire(() => {
      result.current.updateJournalNote(today, 'A calm thought');
    });
    expect(result.current.getJournalDay(today).note).toBe('A calm thought');
    expect(result.current.getJournalDay(yesterday).note).toBe('');

    await fire(() => {
      result.current.updateJournalNote(yesterday, 'Yesterday note');
    });
    expect(result.current.getJournalDay(today).note).toBe('A calm thought');
    expect(result.current.getJournalDay(yesterday).note).toBe('Yesterday note');
  });

  it('adds a goal, marks done, then failed, edits, and deletes', async () => {
    const { result } = await renderHook(() => useDailyStore());

    await fire(() => {
      result.current.addGoal(today, 'Ship feature');
    });
    let goals = result.current.getJournalDay(today).goals;
    expect(goals).toHaveLength(1);
    expect(goals[0].status).toBe('pending');

    const goalId = goals[0].id;

    await fire(() => {
      result.current.updateGoal(today, goalId, { status: 'done' });
    });
    expect(result.current.getJournalDay(today).goals[0].status).toBe('done');

    await fire(() => {
      result.current.updateGoal(today, goalId, { status: 'failed' });
    });
    expect(result.current.getJournalDay(today).goals[0].status).toBe('failed');

    await fire(() => {
      result.current.updateGoal(today, goalId, { title: 'Ship more' });
    });
    expect(result.current.getJournalDay(today).goals[0].title).toBe(
      'Ship more',
    );

    await fire(() => {
      result.current.deleteGoal(today, goalId);
    });
    expect(result.current.getJournalDay(today).goals).toHaveLength(0);
  });

  it('isolates goals between dates', async () => {
    const { result } = await renderHook(() => useDailyStore());

    await fire(() => {
      result.current.addGoal(today, 'Today goal');
      result.current.addGoal(yesterday, 'Yesterday goal');
    });

    expect(result.current.getJournalDay(today).goals).toHaveLength(1);
    expect(result.current.getJournalDay(yesterday).goals).toHaveLength(1);
    expect(result.current.getJournalDay(today).goals[0].title).toBe(
      'Today goal',
    );
  });
});

describe('religion flows (daily store)', () => {
  it('changes city and country', async () => {
    const { result } = await renderHook(() => useDailyStore());

    await fire(() => {
      result.current.updateReligionDay(today, {
        city: 'Alexandria',
        country: 'Egypt',
      });
    });

    const day = result.current.getReligionDay(today);
    expect(day.city).toBe('Alexandria');
    expect(day.country).toBe('Egypt');
  });

  it('toggles prayers on and off', async () => {
    const { result } = await renderHook(() => useDailyStore());

    await fire(() => {
      result.current.updateReligionDay(today, {
        prayers: { fajr: true } as never,
      });
    });
    expect(result.current.getReligionDay(today).prayers.fajr).toBe(true);

    await fire(() => {
      result.current.updateReligionDay(today, {
        prayers: { fajr: false } as never,
      });
    });
    expect(result.current.getReligionDay(today).prayers.fajr).toBe(false);
  });

  it('adds a sunnah, updates it, and deletes it', async () => {
    const { result } = await renderHook(() => useDailyStore());

    await fire(() => {
      result.current.addSunnah(today, {
        prayer: 'fajr',
        timing: 'before',
        title: 'Sunnah before Fajr',
      });
    });
    expect(result.current.getReligionDay(today).sunnah).toHaveLength(1);

    const sunnahId = result.current.getReligionDay(today).sunnah[0].id;

    await fire(() => {
      result.current.updateSunnah(today, sunnahId, { status: 'done' });
    });
    expect(result.current.getReligionDay(today).sunnah[0].status).toBe('done');

    await fire(() => {
      result.current.updateSunnah(today, sunnahId, {
        status: 'failed',
        title: 'Updated sunnah',
      });
    });
    const updated = result.current.getReligionDay(today).sunnah[0];
    expect(updated.status).toBe('failed');
    expect(updated.title).toBe('Updated sunnah');

    await fire(() => {
      result.current.deleteSunnah(today, sunnahId);
    });
    expect(result.current.getReligionDay(today).sunnah).toHaveLength(0);
  });

  it('writes a quran wird and marks it complete', async () => {
    const { result } = await renderHook(() => useDailyStore());

    await fire(() => {
      result.current.updateReligionDay(today, { quranWird: '2 pages' });
    });
    expect(result.current.getReligionDay(today).quranWird).toBe('2 pages');

    await fire(() => {
      result.current.updateReligionDay(today, { quranDone: true });
    });
    expect(result.current.getReligionDay(today).quranDone).toBe(true);
  });

  it('adds a book, updates its progress, and deletes it', async () => {
    const { result } = await renderHook(() => useDailyStore());

    await fire(() => {
      result.current.addBook('Seerah');
    });
    expect(result.current.state.religion.books).toHaveLength(1);

    const bookId = result.current.state.religion.books[0].id;

    await fire(() => {
      result.current.updateBook(bookId, { progress: 42 });
    });
    expect(
      result.current.state.religion.books.find((b) => b.id === bookId)
        ?.progress,
    ).toBe(42);

    await fire(() => {
      result.current.updateBook(bookId, { isDone: true });
    });
    expect(
      result.current.state.religion.books.find((b) => b.id === bookId)?.isDone,
    ).toBe(true);

    await fire(() => {
      result.current.deleteBook(bookId);
    });
    expect(result.current.state.religion.books).toHaveLength(0);
  });

  it('marks a religious lesson done/failed with a note', async () => {
    const { result } = await renderHook(() => useDailyStore());

    await fire(() => {
      result.current.updateReligionDay(today, {
        lessonNote: 'Tafsir lesson 3',
        lessonStatus: 'done',
      });
    });
    expect(result.current.getReligionDay(today).lessonNote).toBe(
      'Tafsir lesson 3',
    );
    expect(result.current.getReligionDay(today).lessonStatus).toBe('done');

    await fire(() => {
      result.current.updateReligionDay(today, { lessonStatus: 'failed' });
    });
    expect(result.current.getReligionDay(today).lessonStatus).toBe('failed');
  });

  it('adds a yearly goal, sets its percentage, and deletes it', async () => {
    const { result } = await renderHook(() => useDailyStore());

    await fire(() => {
      result.current.addYearGoal('Memorize Juz Amma');
    });
    expect(result.current.state.religion.yearlyGoals).toHaveLength(1);

    const goalId = result.current.state.religion.yearlyGoals[0].id;

    await fire(() => {
      result.current.updateYearGoal(goalId, { progress: 65 });
    });
    expect(
      result.current.state.religion.yearlyGoals.find((g) => g.id === goalId)
        ?.progress,
    ).toBe(65);

    await fire(() => {
      result.current.deleteYearGoal(goalId);
    });
    expect(result.current.state.religion.yearlyGoals).toHaveLength(0);
  });

  it('isolates religion day data between dates', async () => {
    const { result } = await renderHook(() => useDailyStore());

    await fire(() => {
      result.current.updateReligionDay(today, {
        prayers: { fajr: true } as never,
      });
      result.current.updateReligionDay(yesterday, {
        prayers: { dhuhr: true } as never,
      });
    });

    expect(result.current.getReligionDay(today).prayers.fajr).toBe(true);
    expect(result.current.getReligionDay(today).prayers.dhuhr).toBe(false);
    expect(result.current.getReligionDay(yesterday).prayers.dhuhr).toBe(true);
    expect(result.current.getReligionDay(yesterday).prayers.fajr).toBe(false);
  });
});

describe('stats reflect usage', () => {
  it('records a done status for today after toggling a habit', async () => {
    await addLoop(database, {
      cadence: 'daily',
      impact: 'high',
      title: 'Walk',
    });
    const habit = await getLoopById(
      (await getLoops(database)).find((l) => l.title === 'Walk')!.id,
    );

    await setLoopTodayStatus(database, habit, 'done', today);
    const stored = await getLoopById(habit.id);
    const todayStatus = stored.history.find(
      (entry) => entry.date === today,
    )?.status;
    expect(todayStatus).toBe('done');
  });
});

describe('region settings (AppPreferences)', () => {
  function wrapper({ children }: PropsWithChildren) {
    return createElement(AppPreferencesProvider, null, children);
  }

  it('defaults to Egypt / Cairo, persists updates, and falls back on blank', async () => {
    const { result, unmount } = await renderHook(() => useAppPreferences(), {
      wrapper,
    });

    expect(result.current.region.country).toBe('Egypt');
    expect(result.current.region.city).toBe('Cairo');

    await fire(() => {
      result.current.updateRegion({ city: 'Alexandria', country: 'Egypt' });
    });
    expect(result.current.region.city).toBe('Alexandria');

    await fire(() => {
      result.current.updateRegion({ city: '   ', country: '   ' });
    });
    expect(result.current.region.city).toBe('Cairo');
    expect(result.current.region.country).toBe('Egypt');
    unmount();
  });

  it('reads back the saved region on a fresh provider mount (localStorage)', async () => {
    const first = await renderHook(() => useAppPreferences(), { wrapper });
    await fire(() => {
      first.result.current.updateRegion({ city: 'Giza', country: 'Egypt' });
    });
    first.unmount();

    const second = await renderHook(() => useAppPreferences(), { wrapper });
    expect(second.result.current.region.city).toBe('Giza');
    expect(second.result.current.region.country).toBe('Egypt');
    second.unmount();
  });
});
