export type LoopDatabase = {
  platform: 'web';
};

let databasePromise: Promise<LoopDatabase> | null = null;

export function openLoopDatabase() {
  if (!databasePromise) {
    databasePromise = Promise.resolve({ platform: 'web' });
  }

  return databasePromise;
}
