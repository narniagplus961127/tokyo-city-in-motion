# Tokyo — A city in motion

A cinematic, scroll-driven city experience made with **React, Vite, Tailwind CSS, and Three.js**, configured for Vercel. No Next.js, API keys, or backend required.

[Live website](https://tokyo-city-in-motion.vercel.app) · [GitHub repository](https://github.com/narniagplus961127/tokyo-city-in-motion)

Dark mode is the default, including the initial page background and 3D lighting. The day/night toggle remains available.

## Publishing and write access

The repository is connected to the `tokyo-city-in-motion` Vercel project. Pushes to `main` deploy the production website automatically.

Active GitHub rulesets protect all branches and tags. Creation, updates, deletion, and force pushes are restricted, with only `narniagplus961127` on the bypass list. The repository is public: others can read or fork the source and suggest pull requests, but cannot push changes to this repository. The `.github/CODEOWNERS` file also identifies the owner for every file. Enforcement comes from the repository rulesets, not from CODEOWNERS alone.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite.

## Build and deploy

```sh
npm run build
npm run preview
```

Import this directory as a Vercel project, or run `npx vercel` from this directory. The included `vercel.json` selects Vite, builds with `npm run build`, and publishes `dist`.

## The experience

- Four scroll chapters with interpolated 3D camera positions.
- An original procedural Tokyo diorama: open-lattice Tokyo Tower, buildings, detailed windows, cherry trees, shrine, canal bridges, streets, cars, and an animated commuter train.
- Day and night lighting, emissive windows, and a pause control for ambient motion.
- Mouse parallax, responsive camera framing, and keyboard-accessible chapter navigation.
- System reduced-motion preference support, accessible native dialog, and a WebGL-unavailable message with the story still accessible.
- Lazy-loaded 3D code, merged static geometry, capped pixel density, and suspended rendering while the browser tab is hidden.

## Source guide

- `src/App.jsx`: chapter copy, navigation, controls, and dialog.
- `src/CityScene.jsx`: city model, lighting, camera keyframes, and rendering lifecycle.
- `src/styles.css`: Tailwind import, typography, responsive layout, and themes.

The city is an artistic interpretation, not an accurate street map. All 3D geometry is constructed in code; there are no external model or image assets. Fonts are Manrope and DM Sans from Google Fonts, with local sans-serif fallbacks. Icons use Lucide.

## Validation

The production build passes. Browser checks cover the 3D canvas, day/night switching, chapter navigation, dialog opening and Escape dismissal, mobile overflow, and reduced-motion preference. WebGL rendering was checked in desktop Chromium; physical mobile devices have not been tested.
