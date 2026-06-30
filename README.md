# Loop

A calm, focused daily loop: track habits, write a short journal, mark prayers,
and watch your daily commitment across the week — without the noise.

Built with **React Native + Expo**. Runs on Android and Web.

> **Download** the latest Android build from the
> [Releases page](https://github.com/Yassen0-0/loop/releases/latest) →
> grab `loop-v0.1.0.apk` and install it directly on your phone.

---

## Features

### Habits
- Add / edit / delete habits with impact (high / medium / low) and cadence (daily / weekly).
- Mark each habit **Done**, **Failed**, or back to **Pending** by tapping the same status again.
- A 7-day strip lets you jump to any past day — each date keeps its own state.
- Per-habit detail sheet with commitment %, streak, recent 14 days, and a 4-week month view.

### Journal & Goals
- A single calm note per day — your thought for the date.
- Add goals, mark **Done** (blue strikethrough) or **Failed** (red strikethrough), edit, and delete.
- Everything is keyed by date, so switching days brings back that day's notes and goals.

### Religion
- Five daily prayers with toggle and prayer times shown from your saved region.
- Daily progress computed from the prayers you actually see.
- Books and yearly religious goals with editable progress (%) and delete.
- **City / country are set in Settings**, not on this screen — keeps the page focused.

### Settings
- Theme: system / dark / light.
- Language: English / العربية (with RTL handling).
- **Region**: country + city, saved to local storage and read by the Religion screen.
- Optional 4-digit PIN lock.

### Stats
- Best day, worst day, and current streak over `week / month / year / all` filters.
- Reads from real usage data across habits, goals, and religion tasks.

---

## Screens

| Habits | Journal & Goals | Religion |
|---|---|---|

(Built-in screenshots live in `docs/` once added.)

---

## Run it locally

```bash
# install
npm install

# web (fast feedback loop)
npm run web
# → http://localhost:8080  (or 8090 if you pass --port)

# android (emulator or device)
npm run android

# quality gates
npm run typecheck
npm run lint
npm run format:check
npm run test
node .agents/skills/impeccable/scripts/detect.mjs --json src
```

The web target uses a `localStorage` fallback instead of `expo-sqlite`, so the
app loads fully in a browser without any native module.

---

## Build the APK yourself

The repo ships a `releases/` folder that's git-ignored — place your built APK there.

```bash
# generate the native android project
npx expo prebuild --platform android --clean

# build a release APK (needs Android SDK + JDK 17)
cd android && ./gradlew assembleRelease
# output: android/app/build/outputs/apk/release/app-release.apk
```

Sign it with your keystore before publishing. The committed APK in the GitHub
Release is already signed with a release keystore.

---

## Project structure

```
src/
  application/        app providers, root layout
  navigation/         bottom tab navigator (Settings hidden)
  screens/
    habits/           HabitsScreen + detail / add / edit sheet
    journal/          JournalGoalsScreen (note + goals)
    religion/         ReligionScreen (prayers, books, yearly goals)
    stats/            StatsScreen (best/worst/streak over filters)
    settings/         Settings (theme, language, region, lock)
    welcome/          onboarding screen
    lock/             PIN lock screen
  features/
    loops/            habits repository + stats (sqlite native, localStorage web)
    daily/            journal + religion state in localStorage
  shared/
    components/       DateStrip
    date/             dateUtils
    i18n/             ar + en translations, RTL
    preferences/      AppPreferencesProvider (profile, lock, region)
    theme/            light + dark themes
    test/             jest setup
```

---

## Notes & honest limitations

- **Prayer times are offline presets for Egypt only.** Three cities are bundled
  (Cairo, Giza, Alexandria) with fixed seasonal times. Any other city falls back
  to Cairo's preset. For accurate worldwide prayer times you'd need an external
  API (e.g. Aladhan) or a calculation library (e.g. Adhan). This is deliberately
  not hidden — see `src/features/daily/dailyStore.ts` for the preset table.
- Data is stored locally on the device (`localStorage` on web, `expo-sqlite` on
  native). There is no cloud sync and no account.
- The project builds a release APK locally; store submission (Play / App Store)
  is out of scope for v0.1.0.

---

## License

Private project, all rights reserved by the author. See commit history for
contributors.

> Built calmly, one loop at a time.