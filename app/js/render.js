// Rendering for the tracker: the checklist rows, the guide pane beside it,
// the progress bar and stats, and the spoiler mask that hides hidden trophies.
// v2: rows show difficulty dots, a time estimate and an "unconfirmed" badge;
// the detail pane shows numbered steps and tips; a stats strip under the
// toolbar summarises what is left, how long it may take, and the hardest
// trophy still unearned.
import { GRADE_ORDER, KIND_LABELS, DIFFICULTY_LABELS, sortTrophies, formatHours, remainingEstimate, isUnconfirmed, sourceName, sourceUrl } from './data.js';

// isMasked: a hidden trophy stays masked while spoilers are on and it is unearned.
export function isMasked(trophy, spoilersOn, earned) {
  return spoilersOn && trophy.hidden && !earned.has(trophy.id);
}

// filterTrophies: the trophies that match the toolbar (search, kind, grade,
// difficulty, status, earned-only), in the chosen sort order. The search
// looks at the name, description, guide, steps and tips. The spoiler setting
// never removes a row, it only masks it.
export function filterTrophies(trophies, filters) {
  const q = filters.search.trim().toLowerCase();
  const matched = trophies.filter((t) => {
    if (filters.kind === 'missable' && !t.missable) return false;
    if (filters.kind !== 'all' && filters.kind !== 'missable' && t.kind !== filters.kind) return false;
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.difficulty && filters.difficulty !== 'all' && String(t.difficulty) !== filters.difficulty) return false;
    if (filters.status === 'unconfirmed' && t.status !== 'unconfirmed') return false;
    if (filters.status === 'confirmed' && t.status !== 'confirmed') return false;
    if (filters.earnedOnly && !filters.earned.has(t.id)) return false;
    if (q) {
      const haystack = [t.name, t.description, t.guide, ...(t.steps || []), ...(t.tips || [])]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
  return sortTrophies(matched, filters.sort || 'default');
}

// updateProgressBar: the header bar, counts and per-grade tally.
export function updateProgressBar(trophies, earned) {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('progress-text').textContent = `${done} of ${total} earned`;
  document.getElementById('progress-pct').textContent = `${pct}%`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  const parts = GRADE_ORDER.map((g) => {
    const inGrade = trophies.filter((t) => t.grade === g);
    const got = inGrade.filter((t) => earned.has(t.id)).length;
    return `${got}/${inGrade.length} ${g}`;
  });
  document.getElementById('grade-counts').textContent = parts.join(' · ');
}

// renderStats: the strip under the toolbar — what is left, the rough time
// left (a sum of per-trophy estimates, so it overlaps and is labelled rough),
// the hardest trophy still unearned, and how many are still unconfirmed.
export function renderStats(trophies, earned) {
  const strip = document.getElementById('stats-strip');
  if (!strip) return;
  const left = trophies.filter((t) => !earned.has(t.id));
  const { minutes, unknown } = remainingEstimate(trophies, earned);
  const hardest = [...left].sort((a, b) => b.difficulty - a.difficulty || (b.timeMin ?? 0) - (a.timeMin ?? 0))[0];
  const unconfirmed = left.filter((t) => isUnconfirmed(t)).length;
  const byKind = {};
  for (const t of left) byKind[t.kind] = (byKind[t.kind] || 0) + 1;
  const topKinds = Object.entries(byKind)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k, n]) => `${n} ${KIND_LABELS[k] || k}`)
    .join(' · ');
  strip.replaceChildren();
  const cells = [
    [`${left.length} left`, topKinds || 'All done — platinum time'],
    [`~${formatHours(minutes)} left`, `rough sum of per-trophy estimates${unknown ? ` · ${unknown} without an estimate` : ''}`],
    [hardest ? `Hardest left: ${hardest.name}` : 'Nothing left', hardest ? `Difficulty ${hardest.difficulty}/5 (${DIFFICULTY_LABELS[hardest.difficulty]}) · ${hardest.time}` : 'Every trophy is earned'],
    [`${unconfirmed} unconfirmed`, unconfirmed ? 'No confirmed unlock method yet — see their guides' : 'Every remaining trophy has a confirmed method'],
  ];
  for (const [big, small] of cells) {
    const cell = document.createElement('div');
    cell.className = 'stat-cell';
    const b = document.createElement('div');
    b.className = 'stat-big';
    b.textContent = big;
    const s = document.createElement('div');
    s.className = 'stat-small';
    s.textContent = small;
    cell.append(b, s);
    strip.append(cell);
  }
}

// difficultyText: a plain-text difficulty label for the stats strip.
export function difficultyText(difficulty) {
  return `${difficulty}/5 (${DIFFICULTY_LABELS[difficulty] || 'unknown'})`;
}

// gradeBadge: a coloured grade pill.
function gradeBadge(grade) {
  const span = document.createElement('span');
  span.className = `badge ${grade}`;
  span.textContent = grade;
  return span;
}

// difficultyDots: five dots, filled up to the trophy's difficulty, with a
// text label for screen readers.
function difficultyDots(difficulty) {
  const span = document.createElement('span');
  span.className = 'difficulty';
  span.title = `Difficulty ${difficulty}/5 — ${DIFFICULTY_LABELS[difficulty] || ''} (estimate)`;
  span.setAttribute('aria-label', span.title);
  for (let i = 1; i <= 5; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i <= difficulty ? ' on' : '');
    dot.textContent = '●';
    span.append(dot);
  }
  return span;
}

// tagRow: the badges under a trophy row or in the detail pane.
function tagRow(t, doc) {
  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  tags.append(gradeBadge(t.grade));
  if (t.hidden) {
    const h = document.createElement('span');
    h.className = 'badge hidden-flag';
    h.textContent = 'hidden';
    tags.append(h);
  }
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'badge missable';
    m.textContent = 'missable';
    tags.append(m);
  }
  if (isUnconfirmed(t)) {
    const u = document.createElement('span');
    u.className = 'badge unconfirmed';
    u.textContent = 'unconfirmed';
    tags.append(u);
  }
  const k = document.createElement('span');
  k.className = 'badge kind';
  k.textContent = KIND_LABELS[t.kind] || t.kind;
  tags.append(k);
  const time = document.createElement('span');
  time.className = 'badge time-badge';
  time.textContent = t.time;
  tags.append(time);
  if (t.target) {
    const tg = document.createElement('span');
    tg.className = 'badge target';
    tg.textContent = `PSN target ${t.target.toLocaleString('en-US')}`;
    tags.append(tg);
  }
  return tags;
}

// renderTrophyList: one row per matching trophy; a click opens its guide.
export function renderTrophyList(trophies, doc, earned, spoilersOn, filters, selectedId, onSelect, onToggle) {
  const list = document.getElementById('trophy-list');
  list.replaceChildren();
  const shown = filterTrophies(trophies, { ...filters, earned });
  document.getElementById('list-meta').textContent =
    `${shown.length} of ${trophies.length} trophies shown` +
    (spoilersOn ? ' · spoilers hidden until earned' : ' · spoilers shown');
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'trophy-row' + (earned.has(t.id) ? ' earned' : '') + (t.id === selectedId ? ' selected' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', () => onToggle(t.id, box.checked));
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'trophy-name';
    if (isMasked(t, spoilersOn, earned)) {
      const lock = document.createElement('span');
      lock.className = 'locked';
      lock.textContent = 'Hidden trophy — earn it to reveal';
      name.append(lock);
    } else {
      name.textContent = t.name;
    }
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = isMasked(t, spoilersOn, earned) ? 'Hidden on PlayStation until earned.' : t.description;
    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    meta.append(difficultyDots(t.difficulty));
    const time = document.createElement('span');
    time.className = 'trophy-time';
    time.textContent = t.time;
    meta.append(time);
    body.append(name, desc, meta, tagRow(t, doc));
    const check = document.createElement('span');
    check.className = 'trophy-check';
    check.textContent = earned.has(t.id) ? '✓' : '';
    li.append(box, body, check);
    li.addEventListener('click', () => onSelect(t.id));
    list.append(li);
  }
  if (shown.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'detail-empty';
    empty.textContent = 'No trophies match these filters.';
    list.append(empty);
  }
}

// renderTrophyDetail: the guide pane for one trophy, with steps, tips and sources.
export function renderTrophyDetail(trophy, doc, earned, spoilersOn, onToggle) {
  const pane = document.getElementById('detail-pane');
  pane.replaceChildren();
  if (!trophy) {
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Pick a trophy from the list to read its guide, its sources, and when it can be missed.';
    pane.append(p);
    return;
  }
  if (isMasked(trophy, spoilersOn, earned)) {
    const h = document.createElement('h2');
    h.textContent = 'Hidden trophy';
    const p = document.createElement('p');
    p.className = 'official';
    p.textContent = 'This trophy stays hidden on PlayStation until you earn it. Turn spoilers off in the toolbar, or tick it earned, to see its name and guide.';
    pane.append(h, p);
    return;
  }
  const h = document.createElement('h2');
  h.textContent = trophy.name;
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = trophy.description;
  const diffLine = document.createElement('p');
  diffLine.className = 'detail-facts';
  diffLine.textContent = `Difficulty ${trophy.difficulty}/5 (${DIFFICULTY_LABELS[trophy.difficulty] || ''}, estimate) · About ${trophy.time} · ${trophy.missable ? 'Potentially missable' : 'Cannot be missed'} · ${isUnconfirmed(trophy) ? 'Unlock method unconfirmed' : 'Method confirmed'}`;
  pane.append(h, official, tagRow(trophy, doc), diffLine);
  const guideHead = document.createElement('h3');
  guideHead.textContent = 'How to get it';
  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = trophy.guide;
  pane.append(guideHead, guide);
  if (trophy.steps && trophy.steps.length) {
    const stepsHead = document.createElement('h3');
    stepsHead.textContent = isUnconfirmed(trophy) ? 'What is known so far' : 'Steps';
    const steps = document.createElement('ol');
    steps.className = 'steps-list';
    for (const step of trophy.steps) {
      const item = document.createElement('li');
      item.textContent = step;
      steps.append(item);
    }
    pane.append(stepsHead, steps);
  }
  if (trophy.tips && trophy.tips.length) {
    const tipsHead = document.createElement('h3');
    tipsHead.textContent = 'Tips';
    const tips = document.createElement('ul');
    tips.className = 'tips-list';
    for (const tip of trophy.tips) {
      const item = document.createElement('li');
      item.textContent = tip;
      tips.append(item);
    }
    pane.append(tipsHead, tips);
  }
  if (trophy.missable) {
    const note = document.createElement('div');
    note.className = 'missable-note';
    note.textContent = 'Missable warning: do this during Chapter 1, before the chapter ends. There is no mission replay, so keep a manual save at the start of Chapter 1.';
    pane.append(note);
  }
  if (isUnconfirmed(trophy)) {
    const note = document.createElement('div');
    note.className = 'unconfirmed-note';
    note.textContent = 'Unconfirmed: no cited guide has verified how this trophy unlocks yet. This guide says what is known and marks the rest as unknown rather than guessing.';
    pane.append(note);
  }
  const srcHead = document.createElement('h3');
  srcHead.textContent = 'Sources';
  const list = document.createElement('ul');
  list.className = 'source-list';
  for (const key of trophy.sources) {
    const item = document.createElement('li');
    const a = document.createElement('a');
    a.href = sourceUrl(doc, key);
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = sourceName(doc, key);
    item.append(a);
    list.append(item);
  }
  const actions = document.createElement('div');
  actions.className = 'detail-actions';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = earned.has(trophy.id) ? 'Mark as not earned' : 'Mark as earned';
  if (earned.has(trophy.id)) btn.classList.add('undo');
  btn.addEventListener('click', () => onToggle(trophy.id, !earned.has(trophy.id)));
  actions.append(btn);
  pane.append(srcHead, list, actions);
}
