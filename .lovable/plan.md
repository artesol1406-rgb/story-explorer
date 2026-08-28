# Mandala Fractal Narrativo — Remix

Adapt the reference app (https://story-fractal-explorer.lovable.app) into this project. Keep its dark, golden "cyber-occult" mandala aesthetic and three-panel layout, add the requested remix features: bilingual ES/EN toggle, both hardcoded reference sets and seed-generated mapping, PDF export, and node drill-in.

This is a client-side generative tool — no auth, no database, no Lovable Cloud. All logic runs in the browser.

## What the app does

A writer configures a story's core DNA (title, system, protagonist, lack, internal antagonist, genre, seed) and tunes four sliders (fractal depth, stations, tension, light). The app deterministically derives a **mandala** — a glowing ring of Hero's-Journey stations, each fused with a tarot arcana, a chakra, and a personality node — from a hash of the seed. The user clicks any station to drill into its sub-structure, and exports the whole thing as JSON or PDF.

## Layout (single route `/`)

Three-column desktop layout collapsing to stacked panels on mobile; a thin header with title, signature, and language toggle.

```text
┌──────────────────────────────────────────────────────────────┐
│  MANDALA FRACTAL NARRATIVO   ·  12 est · 7 chakras · 22 arcanos · firma 92c1f92f   [ES|EN] │
├───────────────┬──────────────────────────────┬────────────────┤
│  PARÁMETROS   │                              │   NODO MAPA    │
│  INICIALES    │       CÍRCULO COMPLETO       │   FLUJO LEYENDA│
│               │      (mandala canvas)        │                │
│  inputs       │   ● station nodes, glow,     │  selected node │
│  sliders      │   fractal sub-circles        │  details:      │
│  buttons      │   [ENTRAR AL NODO] [SALIR]    │  arcana/chakra/│
│  checkboxes   │                              │  personality   │
└───────────────┴──────────────────────────────┴────────────────┘
```

## Left panel — ParametersPanel

- Text inputs: Title, System, Protagonist, Lack, Internal Antagonist.
- Genre dropdown: mito / tragedia / iniciacion / ciencia ficcion / romance / terror.
- Seed text field + **MUTAR SEMILLA** button (generates a fresh random seed like `aleph-7`).
- Sliders: Fractal depth (1–5, default 2), Stations (4–12, default 12), Tension (0–100, default 58), Light (0–100, default 42).
- Buttons: **EXPORTAR JSON**, **EXPORTAR PDF**.
- Checkboxes: "campo de escape" (nodes drift outward), "pulso" (breathing pulse animation).

## Center — MandalaCanvas

- Single HTML `<canvas>` rendered with `requestAnimationFrame` when `pulso` is on, else static redraw on param change.
- Deterministic geometry from a seeded PRNG (mulberry32 seeded by a string-hash of the seed).
- Fractal depth N → N concentric rings; each ring is N-fold; hundreds of glowing neon circles (cyan/magenta/yellow/green/orange/blue) drawn with radial-gradient fills + shadowBlur, tinted by Light and Tension.
- 12 Hero's-Journey station nodes placed on the outer ring, each clickable. Labels drawn on canvas (ES/EN) with the assigned arcana name beneath.
- **Node drill-in**: clicking a station (or ENTRAR AL NODO) zooms the canvas into that station's mini-circle of 7 chakras + its personality-node satellites; SALIR returns to the full circle. Zoom/pan via wheel (cursor-anchored) + drag, per the wheel-zoom pattern.
- Click hit-testing by station index from pointer coords.

## Right panel — InfoPanel (tabs)

- **NODO**: full detail of the selected/zoomed station — journey stage, assigned arcana (name + meaning), assigned chakra (name + meaning), assigned personality node (name + meaning). Empty-state prompt when nothing selected.
- **MAPA**: compact list/grid of all 12 stations with their arcana + chakra, clickable to select.
- **FLUJO**: the station sequence as a numbered flow with tension/light values per step.
- **LEYENDA**: static reference keys — 12 stations, 7 chakras, 22 arcana, 32 personality nodes (names + one-line meanings).

## Data model

Hardcoded reference sets (each entry bilingual ES/EN), in `src/lib/narrative-data.ts`:
- 12 Hero's Journey stations (Mundo ordinario → Elíxir) with meaning.
- 7 chakras (root → crown) with color + meaning.
- 22 tarot major arcana (El Loco → El Mundo) with meaning.
- 32 personality nodes (named archetypes) with meaning.

Seed-generated mapping in `src/lib/mandala.ts`:
- `stringHash(seed)` → mulberry32 PRNG.
- Assign each station one arcana, one chakra, one personality node by PRNG draw (no repeats within a category where the set is large enough).
- Derive the canvas geometry (ring counts, radii, colors, station angles) from the same PRNG + the sliders.
- `signature(seed)` = short hex of the hash, shown in the header.

## Bilingual

`src/lib/i18n.ts` exports a `t` lookup keyed by language; a React context (`LanguageProvider` + `useLanguage`) holds `es`/`en` and feeds every label and reference meaning. Header toggle button switches instantly with no reload.

## Exports

- **JSON**: serialize `{ params, seed, signature, stations: [{station, arcana, chakra, personalityNode}], generatedAt }` and trigger a `.json` download.
- **PDF**: client-side via `jsPDF`. Embed the canvas as a PNG data URL (page 1) + a text table of the 12 stations with their arcana/chakra/personality (page 2). Spanish/English text uses jsPDF's default fonts cautiously (no exotic glyphs beyond ASCII-ish); keep labels ASCII-safe where possible.

## Files to create

- `src/routes/index.tsx` — the single page (replaces placeholder).
- `src/components/MandalaApp.tsx` — orchestrates the three panels + state.
- `src/components/ParametersPanel.tsx`
- `src/components/MandalaCanvas.tsx`
- `src/components/InfoPanel.tsx`
- `src/components/Header.tsx` (title, signature, language toggle)
- `src/lib/narrative-data.ts` — reference sets (bilingual).
- `src/lib/mandala.ts` — PRNG, hash, geometry + mapping generators, signature.
- `src/lib/i18n.ts` — translations + context.
- `src/lib/exports.ts` — JSON + PDF export helpers.
- Update `src/styles.css` theme tokens for the dark/golden palette (background, gold accent, neon chart colors) without breaking the existing token system.
- Update `src/routes/__root.tsx` head metadata (title/description) for the app.
- Install `jspdf` as a dependency.

## Remix changes vs. original (summary)

- Bilingual ES/EN toggle (original is Spanish-only).
- Explicit bilingual reference data + documented seed-generation model (original is opaque).
- PDF export added (original lists the button but the remix makes it real).
- Node drill-in actually implemented as canvas zoom into a station's chakra sub-circle (original implies it).
- Otherwise faithful to the aesthetic and panel structure.

## Verification

- Build passes (check `/tmp/observability/build-errors.log`).
- Canvas renders the mandala with 12 clickable stations; seed change reshapes it deterministically.
- Language toggle flips every visible label.
- JSON export downloads a valid file; PDF export downloads a 2-page PDF with the mandala image + station table.
- Node drill-in zooms into a station and SALIR returns; wheel-zoom anchored at cursor; drag pans.
