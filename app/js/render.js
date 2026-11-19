// Rendering for the tracker: the checklist rows, the guide pane beside it,
// the progress bar, and the spoiler mask that hides hidden trophies.
import { GRADE_ORDER, KIND_LABELS, sourceName, sourceUrl } from './data.js';

// isMasked: a hidden trophy stays masked while spoilers are on and it is unearned.
export function isMasked(trophy, spoilersOn, earned) {
  return spoilersOn && trophy.hidden && !earned.has(trophy.id);
}

// filterTrophies: the trophies that match the toolbar (search, kind, grade,
// earned-only). The spoiler setting never removes a row, it only masks it.
export function filterTrophies(trophies, filters) {
  const q = filters.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (filters.kind === 'missable' && !t.missable) return false;
    if (filters.kind !== 'all' && filters.kind !== 'missable' && t.kind !== filters.kind) return false;
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.earnedOnly && !filters.earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
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

// gradeBadge: a coloured grade pill.
function gradeBadge(grade) {
  const span = document.createElement('span');
  span.className = `badge ${grade}`;
  span.textContent = grade;
  return span;
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
    const k = document.createElement('span');
    k.className = 'badge kind';
    k.textContent = KIND_LABELS[t.kind] || t.kind;
    tags.append(k);
    if (t.target) {
      const tg = document.createElement('span');
      tg.className = 'badge target';
      tg.textContent = `PSN target ${t.target.toLocaleString('en-US')}`;
      tags.append(tg);
    }
    body.append(name, desc, tags);
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

// renderTrophyDetail: the guide pane for one trophy, with its sources.
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
  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  tags.append(gradeBadge(trophy.grade));
  if (trophy.hidden) {
    const hf = document.createElement('span');
    hf.className = 'badge hidden-flag';
    hf.textContent = 'hidden on PSN';
    tags.append(hf);
  }
  if (trophy.missable) {
    const m = document.createElement('span');
    m.className = 'badge missable';
    m.textContent = 'potentially missable';
    tags.append(m);
  }
  const k = document.createElement('span');
  k.className = 'badge kind';
  k.textContent = KIND_LABELS[trophy.kind] || trophy.kind;
  tags.append(k);
  if (trophy.target) {
    const tg = document.createElement('span');
    tg.className = 'badge target';
    tg.textContent = `PSN tracks ${trophy.target.toLocaleString('en-US')}`;
    tags.append(tg);
  }
  const guideHead = document.createElement('h3');
  guideHead.textContent = 'How to get it';
  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = trophy.guide;
  pane.append(h, official, tags, guideHead, guide);
  if (trophy.missable) {
    const note = document.createElement('div');
    note.className = 'missable-note';
    note.textContent = 'Missable warning: do this during Chapter 1, before the chapter ends. There is no mission replay, so keep a manual save at the start of Chapter 1.';
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
