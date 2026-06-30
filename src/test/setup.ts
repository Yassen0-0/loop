jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve({ platform: 'web' })),
}));

const memoryStore = new Map<string, string>();

if (!globalThis.localStorage) {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      clear: () => memoryStore.clear(),
      getItem: (key: string) => memoryStore.get(key) ?? null,
      key: (index: number) => Array.from(memoryStore.keys())[index] ?? null,
      length: memoryStore.size,
      removeItem: (key: string) => {
        memoryStore.delete(key);
      },
      setItem: (key: string, value: string) => {
        memoryStore.set(key, String(value));
      },
    },
  });
}

beforeEach(() => {
  memoryStore.clear();
});
