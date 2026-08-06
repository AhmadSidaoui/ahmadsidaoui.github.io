# Ahmad Sidaoui Portfolio — Mobile App

A React Native (Expo) version of the portfolio site in this repo, so it can run as an
app on your phone. It mirrors the same content as the website (hero, dashboards,
experience, skills, publications, contact) with a native UI.

## Run it on your phone

1. Install the free **Expo Go** app from the App Store (iOS) or Play Store (Android).
2. On a computer with this repo cloned:
   ```bash
   cd mobile
   npm install
   npm start
   ```
3. Scan the QR code that appears in the terminal/browser with:
   - iOS: the Camera app
   - Android: the Expo Go app's "Scan QR code" option

   Your phone and computer need to be on the same Wi-Fi network. If that's not
   possible (e.g. restrictive network), run `npx expo start --tunnel` instead.

The app opens directly in Expo Go — no App Store review, no Xcode/Android Studio
required for this step.

## What's in here

- `App.js` — screens/UI, built with plain `View`/`Text`/`ScrollView` components.
- `src/data.js` — the same content (experience, skills, dashboards, etc.) as
  `src/App.jsx` in the web app, kept as plain data so both can be updated in sync.
- `src/theme.js` — the same color palette as the web app's `src/styles.css`.
- Dashboards open in an in-app WebView (tap "Open dashboard"), with a button to
  open the Power BI link in the phone's browser instead.
- "Download CV" and dashboard links point at the deployed site
  (`https://ahmadsidaoui.github.io`), since the PDF isn't bundled into the app.

## Building a real installable app (optional, no phone needed to start)

To get an actual `.ipa`/`.apk` you can install permanently (not just via Expo Go),
use [EAS Build](https://docs.expo.dev/build/introduction/), Expo's cloud build
service — it doesn't require a Mac or Android Studio:

```bash
npm install -g eas-cli
eas login
eas build --platform android   # or ios
```

Before a production build, replace the placeholder icons in `assets/` (currently
default Expo icons, plus a full-size copy of the site's profile photo) with
properly sized, square icon/splash images.

## Project layout

```
mobile/
  App.js          # main app UI
  index.js         # Expo entry point
  app.json         # Expo app config (name, bundle id, icons)
  src/
    data.js         # content (kept in sync with the web app's App.jsx)
    theme.js         # color palette (kept in sync with the web app's styles.css)
  assets/           # app icons, splash, and profile photo
```
