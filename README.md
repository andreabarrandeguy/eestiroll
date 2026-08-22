# EestiRoll 🎲

A gamified Estonian vocabulary app. Roll a random set of Estonian words, build a sentence using them, and get instant AI feedback on your grammar.

Live on web: **[andreabarrandeguy.github.io/eestiroll](https://andreabarrandeguy.github.io/eestiroll/)**

## How it works

1. Roll a hand of random Estonian words (filtered by category and vocabulary level).
2. Write a sentence using as many of them as you can.
3. Submit it for an AI check — you get a score out of 5, what's wrong, the grammar rule involved, and a corrected version.
4. Past attempts are saved to History so you can review them later.

## Tech stack

- **App**: [Expo](https://expo.dev) / React Native (SDK 54), TypeScript, [Expo Router](https://docs.expo.dev/router/introduction/) for file-based routing. Runs on iOS, Android, and Web from one codebase.
- **AI grammar check**: a Django API hosted on PythonAnywhere, which calls OpenAI and returns a structured evaluation of the submitted sentence.
- **Data**: [Supabase](https://supabase.com) (Postgres) for the email subscriber list and in-app feedback submissions.
- **Analytics**: [PostHog](https://posthog.com).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Add a `.env` file with the Supabase and PostHog keys (see `config/supabase.ts` and `app/_layout.tsx` for the expected `EXPO_PUBLIC_*` variable names).

3. Start the app

   ```bash
   npx expo start
   ```

   From there you can open it in a [development build](https://docs.expo.dev/develop/development-builds/introduction/), an Android/iOS simulator, [Expo Go](https://expo.dev/go), or the web (press `w`).

## Project structure

- `app/` — screens and routes (Expo Router: file-based, so file names matter).
- `components/` — shared UI (word cards, modals, the custom `Icon` component that renders SVGs on web and Ionicons on native).
- `contexts/` — theme, language, categories, history, and the random-word-roll state.
- `services/` — API clients: the AI grammar check, Supabase feedback/subscribers, analytics.
- `utils/` — word data and translations (the app UI is available in English, Spanish, and Russian).

## Deploying the web build

```bash
npx expo export -p web
```

This exports a static site to `dist/`, which is what gets published to GitHub Pages at the URL above.

## Resetting to a blank template

Not applicable here — this is a working app, not a fresh scaffold. (`npm run reset-project` is left over from `create-expo-app` and would wipe `app/` into an `app-example/` folder; don't run it.)
