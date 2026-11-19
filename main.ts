// Leonida Trophy Guide — the entry program (Node 22, standard library only).
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

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
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
