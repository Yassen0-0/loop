# Testing Matrix

Use this checklist before shipping a build.

## Automated Checks

- `npm run quality`
- `npm run doctor`

## Device Coverage

- Android small phone.
- Android large phone.
- Android tablet or foldable layout.
- iPhone small screen.
- iPhone large screen.
- iPad.

## Runtime States

- First install with an empty database.
- Reopen after data exists.
- Toggle loops repeatedly.
- Add several loops.
- Airplane mode.
- Low storage.
- Light and dark system settings.
- Large accessibility text.

## E2E Smoke

The starter smoke test is at `e2e/maestro/smoke.yaml`.
Use it with a development build that has `com.loop.app` as the app id.
