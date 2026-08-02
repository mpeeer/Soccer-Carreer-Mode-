# Northstar FC — Career Mode

A single-page football career simulation built with React, TypeScript, and Vite. Play as a **manager** controlling the touchline or a **player** earning a place on the pitch. All clubs, players, and competitions are fictional.

## Features

### Landing & onboarding
- Minimal landing page with docs explaining the game
- New career or continue-saved-career entry points
- Three club offers per career with distinct philosophies, budgets, and pathways

### Manager career
- **Central hub** — weekly objectives, upcoming fixtures, squad momentum
- **Squad** — 13-player roster with dynamic form, morale, fitness, contracts, and roles
- **Transfer market** — searchable prospects, shortlist management, scout reports, player interest
- **Academy** — youth prospects with development progress and promotion pathways
- **Club vision** — board objectives, financial control, and club values
- **Live matchday** — auto-advancing match clock (1×/2×/10×), possession bar, shot count, events feed, player performance ratings, and substitution mechanic at halftime

### Player career
- **My player** — rating, form, rivalry score, manager trust, and skill progression
- **Training** — five drill sessions (pace, shooting, passing, dribbling, physical) with energy cost, daily limits, and overnight recovery
- **Live matchday** — narrative-driven match simulation with timed choice points (pass, shoot, run, tackle, hold) and consequence system for missed decisions
- **Club team** — squad view with your career player included

### Shared systems
- **Calendar** — full 38-match season with match days, training days, and transfer deadlines
- **Transfers** — randomly generated transfer approaches with storylines, club perks/risks, and negotiation stages for both manager and player careers
- **Sim clock** — day/night cycle with adjustable speed (1×/2×/10×), mid-match pauses, and per-day processing (player condition, training progress, transfer pop-ups)
- **Save/load** — automatic localStorage persistence with versioned save envelopes, legacy backup, and save-on-tab-close

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript |
| Build | Vite |
| Styling | CSS (custom properties, Inter + DM Mono fonts) |
| Deployment | GitHub Actions → GitHub Pages |

## Requirements

- Node.js 20+
- npm 10+

## Local development

```bash
npm install
npm run dev        # → http://localhost:5173
```

## Production build

```bash
npm run build      # TypeScript check + Vite production bundle
npm run preview    # Serve dist/ locally
```

Output lands in `dist/`. Assets are also mirrored to the repo root for branch-root GitHub Pages fallback.

## GitHub Pages deployment

Deployed at **`https://mpeeer.github.io/Northstar-FC/`** via `.github/workflows/deploy.yml`. Every push to `main` triggers the workflow: install → build → upload artifact → deploy.

## Project structure

```
src/
├── App.tsx           # App component, state, effects, handlers, view components (942 lines)
├── types.ts          # All TypeScript types and interfaces (173 lines)
├── data.tsx          # Constants, data arrays, and data-coupled factories (125 lines)
├── utils.tsx         # Validators, storage helpers, formatters, Icon component (166 lines)
├── index.css         # Full visual system and responsive layout (742 lines)
├── main.tsx          # React entry point
├── index.html        # Vite document shell
└── vite-env.d.ts     # Vite type declarations
```

### Module dependency graph

```
types.ts  ←  data.tsx  ←  utils.tsx  ←  App.tsx
          (no circular dependencies)
```

## Design

Dark SaaS-dashboard aesthetic with solid backgrounds, flat panels, high-contrast data displays, and restrained motion. Inter is the primary typeface with DM Mono for data labels and metrics. All branding, club identities, player likenesses, and competitions are fictional and intentionally separate from licensed football properties.

## License

No license selected. Add one before distributing outside the repository.
