# AMC Math Engine Prototype

This repository contains a lightweight SvelteKit prototype for an online Australian Mathematics Competition inspired practice experience.

## Project layout

- `frontend/` – SvelteKit + Tailwind app with a single interactive problem page
  - `/src/lib/components/MathInput.svelte` – Plain text answer field ready to swap in MathLive or similar later
  - `/src/lib/components/KatexBlock.svelte` – Renders KaTeX expressions after mount
  - `/src/routes/+page.svelte` – Minimal flow showing: problem statement, sequential hints, answer checking, and solution reveal

## Getting started - triggering deploy

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
   (If you installed before this update, run `npm run sync` once to regenerate SvelteKit's `.svelte-kit` files.)
2. Launch the dev server:
   ```bash
   npm run dev -- --open
   ```
3. Open the URL shown in the terminal (defaults to http://localhost:5173).

> **Note:** Installing dependencies requires network access so you may need to run the commands outside restricted environments.
>
> MathLive is not bundled yet because the current npm releases are unavailable in this environment; the `MathInput` component is structured so you can wire it back in when a stable package version is accessible.

## What you can try now

- Type answers directly in the input and receive instant feedback.
- Reveal hints sequentially to mimic the scaffolded coaching experience.
- Unlock the full solution by solving the problem or forcing a reveal to review the worked example.

## Ready for the next iteration

1. Extract the problem definition into structured data (MDX, JSON, or YAML) to enable multiple problems and version control.
2. Add a simple session store (Supabase or Turso + Lucia) to persist progress, hints used, and timing per learner.
3. Integrate MathLive (or another math field library) to capture multi-step working once the package/API is settled.
4. Integrate lightweight analytics (PostHog) to observe where students request hints or give up.
5. Automate formatting and quality checks with `npm run check` once dependencies are installed.
