# Doğruluk Dedektifi

A Turkish fact-checking mobile app built with React Native/Expo SDK 54 + Express API backend in a pnpm monorepo.

## Architecture

```
artifacts/
├── api-server/        Express v5 REST API (port 3001)
│   ├── src/           TypeScript source → built to dist/
│   └── build.mjs      esbuild script
├── mobile/            Expo SDK 54 / React Native 0.81.5
│   ├── app/           Expo Router file-based navigation
│   │   ├── onboarding.tsx     Intro slides → QuickEntry
│   │   ├── leaderboard.tsx    Global rankings
│   │   └── (tabs)/            Main tab navigator
│   │       ├── index.tsx      Home / Dashboard
│   │       ├── lab.tsx        Haber Lab (missions + simulations)
│   │       ├── academy.tsx    Academy (lessons)
│   │       └── profile.tsx    User profile
│   ├── components/    Shared UI components
│   ├── hooks/         Custom hooks (useLabState, useLeaderboard, …)
│   ├── context/       React context (UserContext, ContentContext)
│   └── data/          Static data (missions, lessons, simulations)
└── db/                Drizzle ORM schema + seed scripts
```

## Workflows

| Name | Command | Port |
|------|---------|------|
| API Server | `cd artifacts/api-server && PORT=3001 NODE_ENV=development node ./build.mjs && PORT=3001 node --enable-source-maps ./dist/index.mjs` | 3001 |
| Doğruluk Dedektifi | `node artifacts/mobile/server/web-proxy.js & cd artifacts/mobile && ... ./node_modules/.bin/expo start --host lan --port 18115 --web` | 5000 (proxied) |

## Database

PostgreSQL via `DATABASE_URL` env var. Schema managed with Drizzle ORM.

- `pnpm --filter @workspace/db run push` — push schema
- `pnpm --filter @workspace/db run seed` — seed missions/lessons/simulations

## Onboarding Flow

`Intro Slides (3 swipeable) → QuickEntryScreen`

- **QuickEntryScreen**: anonymous code-name entry + mock Google/Apple buttons (dark cyber theme, `#070B14` bg, neon `#2B7FFF` accents)
- No real auth required — username saved via `UserContext` + AsyncStorage

## Key Design Decisions

- **Dark cyber theme** in onboarding: hardcoded `#070B14` background (independent of light/dark system theme)
- **Leaderboard mock data**: `useLeaderboard` always seeds 8 cyber-agent mock entries so the board is never empty even without real users
- **CelebrationOverlay safe area**: uses `Math.max(insets.top, 56) + 20` to ensure toast always clears the notch
- **SwipeCard height**: `Math.min(height - reservedPx, height * 0.52)` — reserved px varies by screen height to fit card + buttons on all devices (SE through Pro Max)

## User Preferences

- Turkish language throughout the app
- Dark cyberpunk aesthetic for onboarding screens
- No real authentication — anonymous play with optional username
