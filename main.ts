// Leonida Trophy Guide v3 — the entry program (Node 22, standard library only).
// The guide itself is app/: static files that open at app/index.html and work
// offline, with the 55 trophies and their guides in app/data/trophies.json.
// This program hands the entry in: it copies app/ and screenshots/ from
// beside this file to /output and writes /output/dossier.json with the
// vendored make.fun library. vendor/makefun-frontend.ts is the scorer's own
// copy and must stay byte for byte as the kit shipped it.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.)
//
// v2: before building, it validates the trophy data (55 trophies, unique ids,
// every trophy with steps, tips, difficulty, time and status) and prints a
// short deterministic summary, so a broken data file fails loudly here
// instead of silently shipping. It writes nothing into the repo directory:
// every output goes to MAKEFUN_OUTPUT_DIR only. The summary lines are the
// same on every run for the same input (no timestamps, no random values).

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's caps for this competition: at most 4 screenshots of 256 KiB,
// at most 993 files and directories in app/ and 48 MiB of app files, and
// the dossier's text at most 160 KiB. buildDossier refuses anything past
// them, so an entry it writes is one the scorer accepts on those rows.
const DOSSIER_TEXT_MAX_BYTES = 163840;
const SCREENSHOTS_MAX = 4;
const SCREENSHOT_MAX_BYTES = 262144;
const APP_MAX_FILES = 993;
const APP_MAX_BYTES = 50331648;

// validateTrophies: the v2 data contract, checked before anything is copied.
function validateTrophies() {
  const doc = JSON.parse(readFileSync(join(repoRoot, 'app', 'data', 'trophies.json'), 'utf8'));
  const trophies = doc.trophies;
  if (!Array.isArray(trophies) || trophies.length !== 55) {
    throw new Error(`expected 55 trophies, found ${Array.isArray(trophies) ? trophies.length : 'none'}`);
  }
  const ids = new Set();
  for (const t of trophies) {
    if (ids.has(t.id)) throw new Error(`duplicate trophy id ${t.id}`);
    ids.add(t.id);
    for (const field of ['name', 'description', 'grade', 'time', 'status']) {
      if (typeof t[field] !== 'string' || !t[field]) throw new Error(`trophy ${t.id} is missing ${field}`);
    }
    if (!Number.isInteger(t.difficulty) || t.difficulty < 1 || t.difficulty > 5) {
      throw new Error(`trophy ${t.id} has a bad difficulty`);
    }
    if (!['confirmed', 'unconfirmed'].includes(t.status)) throw new Error(`trophy ${t.id} has a bad status`);
    if (!Array.isArray(t.steps) || t.steps.length === 0) throw new Error(`trophy ${t.id} has no steps`);
    if (!Array.isArray(t.tips) || t.tips.length === 0) throw new Error(`trophy ${t.id} has no tips`);
  }
  const unconfirmed = trophies.filter((t) => t.status === 'unconfirmed').length;
  return { total: trophies.length, unconfirmed };
}

const { total, unconfirmed } = validateTrophies();

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: DOSSIER_TEXT_MAX_BYTES,
    screenshots: { max: SCREENSHOTS_MAX, max_bytes: SCREENSHOT_MAX_BYTES },
    app_max_files: APP_MAX_FILES,
    app_max_bytes: APP_MAX_BYTES,
  }),
);

// Deterministic summary: same input, same lines, every run.
const appFiles = readdirSync(join(outputDir, 'app'), { recursive: true }).length;
const shotFiles = existsSync(join(outputDir, 'screenshots'))
  ? readdirSync(join(outputDir, 'screenshots')).filter((f) => statSync(join(outputDir, 'screenshots', f)).isFile()).length
  : 0;
console.log(`Leonida Trophy Guide v3: ${total} trophies (${unconfirmed} unconfirmed), ${appFiles} app entries, ${shotFiles} screenshots -> ${outputDir}`);
