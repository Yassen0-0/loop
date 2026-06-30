import { useCallback, useEffect, useState } from 'react';

import {
  openLoopDatabase,
  type LoopDatabase,
} from '../../data/database/client';
import {
  addLoop,
  type AddLoopInput,
  deleteLoop,
  getLoops,
  setLoopTodayStatus,
  seedStarterLoops,
  updateLoop,
  type UpdateLoopInput,
} from './loopRepository';
import type { Loop, LoopTodayStatus } from './loopTypes';

type LoopState = {
  database: LoopDatabase | null;
  error: string | null;
  isLoading: boolean;
  loops: Loop[];
};

export function useLoops() {
  const [state, setState] = useState<LoopState>({
    database: null,
    error: null,
    isLoading: true,
    loops: [],
  });

  const refresh = useCallback(async (database: LoopDatabase) => {
    const loops = await getLoops(database);
    setState((current) => ({
      ...current,
      database,
      error: null,
      isLoading: false,
      loops,
    }));
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootDatabase() {
      try {
        const database = await openLoopDatabase();
        await seedStarterLoops(database);

        if (isMounted) {
          await refresh(database);
        }
      } catch (error) {
        if (isMounted) {
          setState((current) => ({
            ...current,
            error:
              error instanceof Error
                ? error.message
                : 'Database could not be opened.',
            isLoading: false,
          }));
        }
      }
    }

    void bootDatabase();

    return () => {
      isMounted = false;
    };
  }, [refresh]);

  const createLoop = useCallback(
    async (input: AddLoopInput) => {
      if (!state.database) {
        return;
      }

      await addLoop(state.database, input);
      await refresh(state.database);
    },
    [refresh, state.database],
  );

  const updateExistingLoop = useCallback(
    async (loopId: string, input: UpdateLoopInput) => {
      if (!state.database) {
        return;
      }

      await updateLoop(state.database, loopId, input);
      await refresh(state.database);
    },
    [refresh, state.database],
  );

  const deleteExistingLoop = useCallback(
    async (loopId: string) => {
      if (!state.database) {
        return;
      }

      await deleteLoop(state.database, loopId);
      await refresh(state.database);
    },
    [refresh, state.database],
  );

  const setTodayStatus = useCallback(
    async (loop: Loop, status: LoopTodayStatus, date?: string) => {
      if (!state.database) {
        return;
      }

      await setLoopTodayStatus(state.database, loop, status, date);
      await refresh(state.database);
    },
    [refresh, state.database],
  );

  return {
    createLoop,
    deleteExistingLoop,
    setTodayStatus,
    updateExistingLoop,
    ...state,
  };
}
