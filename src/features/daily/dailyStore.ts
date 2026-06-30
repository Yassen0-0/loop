import { useCallback, useEffect, useState } from 'react';

import { getDateKey } from '../../shared/date/dateUtils';
import type {
  DailyGoal,
  DailyState,
  JournalDay,
  PrayerName,
  ReligionDay,
  ReligionState,
  ReligiousBook,
  ReligiousYearGoal,
  SunnahPrayer,
} from './dailyTypes';

const storageKey = 'loop.daily.v1';

const prayerNames: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const prayerTimesByCity: Record<string, Record<PrayerName, string>> = {
  Alexandria: {
    fajr: '04:18',
    dhuhr: '13:02',
    asr: '16:39',
    maghrib: '20:10',
    isha: '21:39',
  },
  Cairo: {
    fajr: '04:12',
    dhuhr: '12:59',
    asr: '16:35',
    maghrib: '20:06',
    isha: '21:34',
  },
  Giza: {
    fajr: '04:13',
    dhuhr: '12:59',
    asr: '16:35',
    maghrib: '20:06',
    isha: '21:34',
  },
};

const defaultJournalDay: JournalDay = {
  goals: [],
  note: '',
};

const defaultReligionDay: ReligionDay = {
  city: 'Cairo',
  country: 'Egypt',
  lessonNote: '',
  lessonStatus: 'pending',
  prayers: {
    asr: false,
    dhuhr: false,
    fajr: false,
    isha: false,
    maghrib: false,
  },
  quranDone: false,
  quranWird: '',
  sunnah: [],
};

const defaultReligionState: ReligionState = {
  books: [],
  days: {},
  yearlyGoals: [],
};

const defaultState: DailyState = {
  journal: {},
  religion: defaultReligionState,
};

export function useDailyStore() {
  const [state, setState] = useState<DailyState>(() => readState());

  useEffect(() => {
    writeState(state);
  }, [state]);

  const getJournalDay = useCallback(
    (date = getDateKey()) => state.journal[date] ?? defaultJournalDay,
    [state.journal],
  );

  const updateJournalNote = useCallback((date: string, note: string) => {
    setState((current) => ({
      ...current,
      journal: {
        ...current.journal,
        [date]: {
          ...(current.journal[date] ?? defaultJournalDay),
          note,
        },
      },
    }));
  }, []);

  const addGoal = useCallback((date: string, title: string) => {
    const goal: DailyGoal = {
      id: `goal-${Date.now()}`,
      status: 'pending',
      title: title.trim(),
    };

    setState((current) => {
      const day = current.journal[date] ?? defaultJournalDay;

      return {
        ...current,
        journal: {
          ...current.journal,
          [date]: {
            ...day,
            goals: [...day.goals, goal],
          },
        },
      };
    });
  }, []);

  const updateGoal = useCallback(
    (date: string, goalId: string, patch: Partial<DailyGoal>) => {
      setState((current) => {
        const day = current.journal[date] ?? defaultJournalDay;

        return {
          ...current,
          journal: {
            ...current.journal,
            [date]: {
              ...day,
              goals: day.goals.map((goal) =>
                goal.id === goalId ? { ...goal, ...patch } : goal,
              ),
            },
          },
        };
      });
    },
    [],
  );

  const deleteGoal = useCallback((date: string, goalId: string) => {
    setState((current) => {
      const day = current.journal[date] ?? defaultJournalDay;

      return {
        ...current,
        journal: {
          ...current.journal,
          [date]: {
            ...day,
            goals: day.goals.filter((goal) => goal.id !== goalId),
          },
        },
      };
    });
  }, []);

  const getReligionDay = useCallback(
    (date = getDateKey()) => ({
      ...defaultReligionDay,
      ...(state.religion.days[date] ?? {}),
      prayers: {
        ...defaultReligionDay.prayers,
        ...(state.religion.days[date]?.prayers ?? {}),
      },
      sunnah: state.religion.days[date]?.sunnah ?? [],
    }),
    [state.religion.days],
  );

  const updateReligionDay = useCallback(
    (date: string, patch: Partial<ReligionDay>) => {
      setState((current) => {
        const day = {
          ...defaultReligionDay,
          ...(current.religion.days[date] ?? {}),
        };

        return {
          ...current,
          religion: {
            ...current.religion,
            days: {
              ...current.religion.days,
              [date]: {
                ...day,
                ...patch,
                prayers: {
                  ...day.prayers,
                  ...(patch.prayers ?? {}),
                },
              },
            },
          },
        };
      });
    },
    [],
  );

  const addSunnah = useCallback(
    (date: string, input: Omit<SunnahPrayer, 'id' | 'status'>) => {
      updateReligionDay(date, {
        sunnah: [
          ...getReligionDay(date).sunnah,
          {
            ...input,
            id: `sunnah-${Date.now()}`,
            status: 'pending',
          },
        ],
      });
    },
    [getReligionDay, updateReligionDay],
  );

  const updateSunnah = useCallback(
    (date: string, sunnahId: string, patch: Partial<SunnahPrayer>) => {
      const day = getReligionDay(date);
      updateReligionDay(date, {
        sunnah: day.sunnah.map((item) =>
          item.id === sunnahId ? { ...item, ...patch } : item,
        ),
      });
    },
    [getReligionDay, updateReligionDay],
  );

  const deleteSunnah = useCallback(
    (date: string, sunnahId: string) => {
      const day = getReligionDay(date);
      updateReligionDay(date, {
        sunnah: day.sunnah.filter((item) => item.id !== sunnahId),
      });
    },
    [getReligionDay, updateReligionDay],
  );

  const addBook = useCallback((title: string) => {
    const book: ReligiousBook = {
      id: `book-${Date.now()}`,
      isDone: false,
      progress: 0,
      title: title.trim(),
    };

    setState((current) => ({
      ...current,
      religion: {
        ...current.religion,
        books: [...current.religion.books, book],
      },
    }));
  }, []);

  const updateBook = useCallback(
    (bookId: string, patch: Partial<ReligiousBook>) => {
      setState((current) => ({
        ...current,
        religion: {
          ...current.religion,
          books: current.religion.books.map((book) =>
            book.id === bookId ? { ...book, ...patch } : book,
          ),
        },
      }));
    },
    [],
  );

  const deleteBook = useCallback((bookId: string) => {
    setState((current) => ({
      ...current,
      religion: {
        ...current.religion,
        books: current.religion.books.filter((book) => book.id !== bookId),
      },
    }));
  }, []);

  const addYearGoal = useCallback((title: string) => {
    const goal: ReligiousYearGoal = {
      id: `religion-year-${Date.now()}`,
      progress: 0,
      title: title.trim(),
    };

    setState((current) => ({
      ...current,
      religion: {
        ...current.religion,
        yearlyGoals: [...current.religion.yearlyGoals, goal],
      },
    }));
  }, []);

  const updateYearGoal = useCallback(
    (goalId: string, patch: Partial<ReligiousYearGoal>) => {
      setState((current) => ({
        ...current,
        religion: {
          ...current.religion,
          yearlyGoals: current.religion.yearlyGoals.map((goal) =>
            goal.id === goalId ? { ...goal, ...patch } : goal,
          ),
        },
      }));
    },
    [],
  );

  const deleteYearGoal = useCallback((goalId: string) => {
    setState((current) => ({
      ...current,
      religion: {
        ...current.religion,
        yearlyGoals: current.religion.yearlyGoals.filter(
          (goal) => goal.id !== goalId,
        ),
      },
    }));
  }, []);

  return {
    addBook,
    addGoal,
    addSunnah,
    addYearGoal,
    deleteBook,
    deleteGoal,
    deleteSunnah,
    deleteYearGoal,
    getJournalDay,
    getReligionDay,
    prayerNames,
    prayerTimesByCity,
    state,
    updateBook,
    updateGoal,
    updateJournalNote,
    updateReligionDay,
    updateSunnah,
    updateYearGoal,
  };
}

function readState(): DailyState {
  try {
    const rawValue = globalThis.localStorage?.getItem(storageKey);

    if (!rawValue) {
      return defaultState;
    }

    return normalizeState(JSON.parse(rawValue));
  } catch {
    return defaultState;
  }
}

function writeState(state: DailyState) {
  globalThis.localStorage?.setItem(storageKey, JSON.stringify(state));
}

function normalizeState(value: Partial<DailyState>): DailyState {
  return {
    journal: value.journal ?? {},
    religion: {
      books: value.religion?.books ?? [],
      days: value.religion?.days ?? {},
      yearlyGoals: value.religion?.yearlyGoals ?? [],
    },
  };
}
