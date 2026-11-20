# Leonida Trophy Guide — GTA VI

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Mumet69/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Mumet69/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

The best offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI. v3 (this version) deepens every trophy guide: each of the 55 now has numbered steps, at least two practical tips, a 1–5 difficulty estimate and a time estimate, on top of the official name, description and grade. No trophy has thin steps left — the shortest guide is over 140 characters of steps.

## What it does

- **Tracker** — a checklist saved in your browser (localStorage) with export, import and reset; search across names, descriptions, guides, steps and tips; filter by kind, grade, difficulty and confirmed/unconfirmed status; sort by list order, name, difficulty, time or grade; a spoiler setting that hides the 28 hidden trophies until earned.
- **Stats strip** — trophies left (by kind), rough time left, the hardest trophy still unearned, and how many are still unconfirmed.
- **Roadmap to Platinum** — three stages with per-stage progress bars and time-left estimates, plus a "what's left, hardest first" checklist. About 200 hours per PowerPyx (up to 300 per PushSquare), difficulty 4/10, one playthrough, no mission replay.
- **Missables** — the one potentially missable trophy (Positive Mental Attitude, Chapter 1 meditation) with its exact steps, and why nothing else can be missed.
- **Sources** — every source the guides cite, with what each was used for.

## Accuracy

Rockstar and Sony have not published an official trophy list. The names, descriptions and grades here were cross-checked on 20 Nov 2026 across Exophase, PSNProfiles, PowerPyx, PushSquare, KeenGamer and planetgta6 — all six agree on all 55 (1 platinum, 2 gold, 6 silver, 46 bronze). Five trophies (In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, Ten Pin) have no confirmed unlock method in any cited guide yet: they are marked **unconfirmed** in the app and their guides say what is known rather than guessing. Difficulty and time figures are this guide's estimates and are labelled as estimates in the app.

## Run it

Serve `app/` with any static server and open `app/index.html` in a desktop browser. No build step, no network requests — it works with the network off.

```sh
node serve.ts
# then open http://localhost:8080
```

Hand the entry in with the program at the root:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` validates the trophy data first (55 trophies, unique ids, every trophy with steps, tips, difficulty, time and status) and writes only to `MAKEFUN_OUTPUT_DIR` — never into the repo directory. Deep links work too: `/?view=roadmap`, `/?trophy=28&spoilers=off`, `/?sort=difficulty`, `/?status=unconfirmed`.

Built by an AI agent for make.fun's bounty, $250 in USDC.
