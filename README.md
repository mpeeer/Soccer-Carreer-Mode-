# Northstar FC — Career Mode

Northstar FC is a fictional football management experience focused on the decisions behind matchday: squad selection, player development, scouting, transfers, club finances, and long-term identity.

The interface is built as a dark, data-led manager desk for a single-season career prototype. All clubs, players, competitions, and brands in the experience are fictional.

## Product overview

The career hub puts the full club cycle in one place:

- **Central** — weekly objectives, upcoming fixtures, squad momentum, club briefings, and career progression.
- **Squad** — player ratings, dynamic form, morale, match fitness, contracts, roles, and development actions.
- **Transfer Market** — searchable targets, shortlist management, scout reports, player interest, and active enquiries.
- **Academy** — youth prospects, development progress, recruitment programs, and promotion pathways.
- **Club Vision** — board objectives, financial control, investment requests, and club values.

The prototype includes a lightweight match simulation loop. Advancing the week resolves the next fixture, updates player condition, records the result, and moves the career calendar forward.

## Tech stack

- React
- TypeScript
- Vite
- CSS
- GitHub Actions
- GitHub Pages

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Local development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will print the local address in the terminal, usually `http://localhost:5173`.

## Production build

Create an optimized production build:

```bash
npm run build
```

Preview the production output locally:

```bash
npm run preview
```

The compiled site is written to `dist/`.

## GitHub Pages deployment

The repository is configured for a project site at:

`https://mpeeer.github.io/Northstar-FC/`

Every push to `main` triggers `.github/workflows/deploy.yml`. The workflow installs dependencies, runs the production build, uploads `dist/` as a Pages artifact, and deploys it to GitHub Pages.

The repository also includes a branch-root fallback. If Pages is configured to serve the `main` branch root instead of the Actions artifact, the root entry redirects to the committed `dist/` build. After changing source files, run `npm run build` and include the updated `dist/` files in the commit.

To use the preferred deployment mode in GitHub:

1. Open the repository **Settings**.
2. Open **Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to `main` or run the workflow from the **Actions** tab.

## Project structure

```text
.
├── .github/workflows/deploy.yml  # GitHub Pages deployment
├── src/App.tsx                   # Career mode UI and local game state
├── src/index.css                 # Visual system and responsive layout
├── src/main.tsx                  # React entry point
├── index.html                    # Document shell and metadata
├── vite.config.ts                # Vite configuration and Pages base path
└── package.json                  # Scripts and dependencies
```

## Design direction

Northstar FC uses a compact manager-desk layout with high-contrast data panels, restrained motion, and responsive navigation. The product language is original and intentionally separate from licensed football game branding, club identities, player likenesses, and proprietary assets.

## License

No license has been selected for this repository yet. Add one before distributing the project outside the repository.
