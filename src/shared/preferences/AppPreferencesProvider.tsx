import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';

export type Region = {
  city: string;
  country: string;
};

type AppPreferences = {
  hasCompletedWelcome: boolean;
  isLockEnabled: boolean;
  isUnlocked: boolean;
  phone: string;
  pin: string;
  profileName: string;
  region: Region;
};

type AppPreferencesContextValue = AppPreferences & {
  completeWelcome: () => void;
  disableLock: () => void;
  enableLock: (pin: string) => void;
  lock: () => void;
  resetWelcome: () => void;
  unlock: (pin: string) => boolean;
  updateProfile: (profile: { phone: string; profileName: string }) => void;
  updateRegion: (region: Region) => void;
};

const defaultRegion: Region = {
  city: 'Cairo',
  country: 'Egypt',
};

const defaultPreferences: AppPreferences = {
  hasCompletedWelcome: false,
  isLockEnabled: false,
  isUnlocked: true,
  phone: '',
  pin: '',
  profileName: 'Yassen',
  region: defaultRegion,
};

const storageKey = 'loop.preferences.v1';

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(
  null,
);

export function AppPreferencesProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState<AppPreferences>(() =>
    readPreferences(),
  );

  function updatePreferences(nextPreferences: AppPreferences) {
    setPreferences(nextPreferences);
    writePreferences(nextPreferences);
  }

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      ...preferences,
      completeWelcome: () =>
        updatePreferences({
          ...preferences,
          hasCompletedWelcome: true,
        }),
      disableLock: () =>
        updatePreferences({
          ...preferences,
          isLockEnabled: false,
          isUnlocked: true,
          pin: '',
        }),
      enableLock: (pin: string) =>
        updatePreferences({
          ...preferences,
          isLockEnabled: true,
          isUnlocked: true,
          pin,
        }),
      lock: () =>
        updatePreferences({
          ...preferences,
          isUnlocked: !preferences.isLockEnabled,
        }),
      resetWelcome: () =>
        updatePreferences({
          ...preferences,
          hasCompletedWelcome: false,
          isUnlocked: true,
        }),
      unlock: (pin: string) => {
        const isValid = preferences.pin === pin;

        if (isValid) {
          updatePreferences({
            ...preferences,
            isUnlocked: true,
          });
        }

        return isValid;
      },
      updateProfile: (profile) =>
        updatePreferences({
          ...preferences,
          phone: profile.phone,
          profileName:
            profile.profileName.trim() || defaultPreferences.profileName,
        }),
      updateRegion: (region) =>
        updatePreferences({
          ...preferences,
          region: {
            city: region.city.trim() || defaultRegion.city,
            country: region.country.trim() || defaultRegion.country,
          },
        }),
    }),
    [preferences],
  );

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  );
}

export function useAppPreferences() {
  const value = useContext(AppPreferencesContext);

  if (!value) {
    throw new Error(
      'useAppPreferences must be used inside AppPreferencesProvider.',
    );
  }

  return value;
}

function readPreferences(): AppPreferences {
  try {
    const rawValue = globalThis.localStorage?.getItem(storageKey);

    if (!rawValue) {
      return defaultPreferences;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<AppPreferences>;

    return {
      ...defaultPreferences,
      ...parsedValue,
      isUnlocked: parsedValue.isLockEnabled ? false : true,
      region: {
        ...defaultRegion,
        ...(parsedValue.region ?? {}),
      },
    };
  } catch {
    return defaultPreferences;
  }
}

function writePreferences(preferences: AppPreferences) {
  globalThis.localStorage?.setItem(storageKey, JSON.stringify(preferences));
}
