// The roadmap to the platinum, the missables page, and the sources page.
// All three are built from the official descriptions and the cited guides:
// PowerPyx's roadmap is ~200 hours, difficulty 4/10, one playthrough, no
// mission replay, and a single potentially missable trophy.
import { KIND_LABELS, sourceName, sourceUrl } from './data.js';

const STAGES = [
  {
    stage: 1,
    title: 'Stage 1 — Finish the story',
    meta: 'Chapters 1–5 · about 60–80 hours · PowerPyx',
    points: [
      'Play the five story chapters; the 12 story trophies pop on their own and cannot be missed.',
      'Do the one thing that can be missed: the Chapter 1 meditation for Positive Mental Attitude (see Missables).',
      'Scan vehicles with WAiNK and study animals with binoculars as you go — the 100% checklist counts progress made during the story.',
      'Keep a manual save at the start and end of every chapter (10 saves). There is no mission replay and no New Game+.',
      'Cheats switch trophies and saving off, so keep them off for the whole run.',
    ],
  },
  {
    stage: 2,
    title: 'Stage 2 — The 100% checklist and challenges',
    meta: 'After the story · about 100 hours · Progress > Stats > 100% Completion',
    points: [
      'The checklist opens after the story and is closer to 60% of true completion: any 100 optional missions, any 200 of 277 vehicles scanned, any 100 of 255 animals studied, 300 stunts, and 70 of 80 challenges.',
      'Only a few things need everything: all robberies, all shooting ranges, all drone races, all of Bret’s quests, and the underwater discoveries.',
      'Gold medals at all 12 shooting ranges, a drone race win at all 14 locations, and 5 bank vaults come from this stage.',
      'Nothing toward 100% is missable — everything stays doable in free-roam after the story.',
    ],
  },
  {
    stage: 3,
    title: 'Stage 3 — Strangers & Freaks and cleanup',
    meta: 'Free-roam · about 10 hours',
    points: [
      'Finish the 8 stranger strands that count (Kirk, Kyle, Yago and Pilot Pete are confirmed) and the side questlines: Andy, Kenton, Billy, Randy, Tyrone and Bret.',
      'Sweep up the robbery trophies (jewelry store, armored truck, gang operations), the combat ones (Combat Focus, the VCIA plane, the tank), and the money ones (launder $250,000, spend $100,000, buy the 8 garages, register 10 vehicles).',
      'The platinum, Vice Got a Price!, pops when the last of the other 54 is earned.',
    ],
  },
];

// stageTrophies: the trophies assigned to a roadmap stage.
function stageTrophies(trophies, stage) {
  return trophies.filter((t) => t.stage === stage);
}

// renderRoadmap: the three stages, each with its trophies as clickable chips.
export function renderRoadmap(trophies, earned, onSelect) {
  const view = document.getElementById('roadmap-view');
  view.replaceChildren();
  const intro = document.createElement('div');
  intro.className = 'note-box';
  const h = document.createElement('h2');
  h.textContent = 'Roadmap to the platinum — about 200 hours, difficulty 4/10';
  const p = document.createElement('p');
  p.textContent = 'PowerPyx rates the set 4 out of 10 and about 200 hours, with a single playthrough enough: no difficulty trophies, no mission medals, no online trophies, and no mission replay. Work the stages in order; the checklist in Stage 2 is where most of the time goes.';
  intro.append(h, p);
  view.append(intro);
  for (const s of STAGES) {
    const box = document.createElement('div');
    box.className = 'stage';
    const title = document.createElement('h2');
    title.textContent = s.title;
    const meta = document.createElement('p');
    meta.className = 'stage-meta';
    meta.textContent = s.meta;
    const list = document.createElement('ul');
    for (const point of s.points) {
      const item = document.createElement('li');
      item.textContent = point;
      list.append(item);
    }
    const chips = document.createElement('div');
    chips.className = 'stage-trophies';
    for (const t of stageTrophies(trophies, s.stage)) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip' + (earned.has(t.id) ? ' done' : '');
      chip.textContent = `${earned.has(t.id) ? '✓ ' : ''}${t.name} · ${t.grade}`;
      chip.addEventListener('click', () => onSelect(t.id));
      chips.append(chip);
    }
    box.append(title, meta, list, chips);
    view.append(box);
  }
}

// renderMissables: the one trophy that can be missed, and why the rest cannot.
export function renderMissables(trophies, earned, onSelect) {
  const view = document.getElementById('missables-view');
  view.replaceChildren();
  const warn = document.createElement('div');
  warn.className = 'warn-box';
  const h = document.createElement('h2');
  h.textContent = '1 trophy can be missed — the rest cannot';
  const p = document.createElement('p');
  p.textContent = 'PowerPyx flags exactly one potentially missable trophy. Every other trophy is either automatic from the story or doable in free-roam after it, because there is no mission replay but the story trophies unlock on completion and all side content stays open. The safe habit is still the same: keep a manual save at the start of every chapter (15 manual slots).';
  warn.append(h, p);
  view.append(warn);
  const missed = trophies.filter((t) => t.missable);
  for (const t of missed) {
    const box = document.createElement('div');
    box.className = 'stage';
    const title = document.createElement('h2');
    title.textContent = `${t.name} — ${t.description}`;
    const meta = document.createElement('p');
    meta.className = 'stage-meta';
    meta.textContent = `${t.grade} · ${KIND_LABELS[t.kind] || t.kind} · PSN tracks ${t.target}`;
    const guide = document.createElement('p');
    guide.textContent = t.guide;
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = 'Open its guide';
    chip.addEventListener('click', () => onSelect(t.id));
    box.append(title, meta, guide, chip);
    view.append(box);
  }
  const note = document.createElement('div');
  note.className = 'note-box';
  const nh = document.createElement('h2');
  nh.textContent = 'Why nothing else is missable';
  const np = document.createElement('p');
  np.textContent = 'Story trophies are automatic and unlock as you finish chapters and missions. Side quest givers who go quiet during the story (Kenton, for example) come back later, and optional missions that expire don’t feed any trophy. The 100% checklist is only viewable after the story, and every item on it stays reachable in free-roam. (PowerPyx)';
  note.append(nh, np);
  view.append(note);
}

// renderSources: every source the guides cite, with what it was used for.
export function renderSources(doc) {
  const view = document.getElementById('sources-view');
  view.replaceChildren();
  const box = document.createElement('div');
  box.className = 'stage';
  const h = document.createElement('h2');
  h.textContent = 'Sources';
  const intro = document.createElement('p');
  intro.textContent = 'Every guide in this app is written in our own words. The facts come from these sources, and each trophy’s guide names the ones it draws on. Where a trophy is not yet confirmed, the guide says so instead of guessing.';
  box.append(h, intro);
  const list = document.createElement('ul');
  const uses = {
    exophase: 'Official trophy names, descriptions and grades (the list as PlayStation publishes it).',
    psnprofiles: 'The progress counts PlayStation tracks for each trophy (for example 250 stunts, 42 shooting range challenges, 18 meditation spots).',
    powerpyx: 'The roadmap (about 200 hours, difficulty 4/10, one playthrough, no mission replay), the one potentially missable trophy, and the per-trophy steps — including which five trophies it lists as not yet known.',
    planetgta6: 'Which 28 trophies stay hidden on PlayStation until earned, and which 27 are visible from the start.',
  };
  for (const [key, info] of Object.entries(doc.sources)) {
    const item = document.createElement('li');
    const a = document.createElement('a');
    a.href = sourceUrl(doc, key);
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = sourceName(doc, key);
    item.append(a, document.createTextNode(` — ${uses[key] || ''}`));
    list.append(item);
  }
  box.append(list);
  view.append(box);
}
