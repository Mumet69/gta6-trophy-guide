// loadTrophyData: fetches app/data/trophies.json (the official 55, each with
// its own-words guide, numbered steps, tips, a 1–5 difficulty estimate and a
// time estimate) and hands back the parsed document. v2 adds difficulty,
// time and status fields; older exports that lack them still load, with
// sensible defaults filled in below.
export async function loadTrophyData() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('could not load data/trophies.json');
  const doc = await response.json();
  const base = doc.trophies ? doc : { ...doc, trophies: doc };
  for (const t of base.trophies) {
    if (typeof t.difficulty !== 'number') t.difficulty = 2;
    if (typeof t.time !== 'string') t.time = 'Unknown';
    if (typeof t.timeMin !== 'number') t.timeMin = null;
    if (t.status !== 'unconfirmed') t.status = 'confirmed';
    if (!Array.isArray(t.steps)) t.steps = [];
    if (!Array.isArray(t.tips)) t.tips = [];
  }
  return base;
}

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export const KIND_LABELS = {
  platinum: 'Platinum & 100%',
  story: 'Story',
  side: 'Side quests',
  collectible: 'Collectibles',
  activity: 'Activities',
  robbery: 'Robberies',
  money: 'Money',
  combat: 'Combat',
  exploration: 'Exploration',
  misc: 'Everything else',
};

// Difficulty 1–5, shown as filled dots; 1 is trivial, 5 is the platinum grind.
export const DIFFICULTY_LABELS = {
  1: 'Very easy',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Very hard',
};

// SORTS: the sort orders the tracker offers. 'default' is the official list
// order (platinum first, then the list as PlayStation shows it).
export const SORTS = {
  default: 'List order',
  name: 'Name A–Z',
  difficulty: 'Hardest first',
  easiest: 'Easiest first',
  time: 'Longest first',
  grade: 'Grade (best first)',
};

// sortTrophies: a sorted copy of the list under the given sort key.
export function sortTrophies(trophies, sort) {
  const list = [...trophies];
  const gradeRank = (g) => GRADE_ORDER.indexOf(g);
  switch (sort) {
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case 'difficulty':
      return list.sort((a, b) => b.difficulty - a.difficulty || a.id - b.id);
    case 'easiest':
      return list.sort((a, b) => a.difficulty - b.difficulty || a.id - b.id);
    case 'time':
      return list.sort((a, b) => (b.timeMin ?? -1) - (a.timeMin ?? -1) || a.id - b.id);
    case 'grade':
      return list.sort((a, b) => gradeRank(a.grade) - gradeRank(b.grade) || a.id - b.id);
    default:
      return list.sort((a, b) => a.id - b.id);
  }
}

// formatHours: minutes to a short "12 hrs" / "45 min" label.
export function formatHours(minutes) {
  if (minutes == null || minutes <= 0) return '—';
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hrs`;
}

// remainingEstimate: total estimated minutes left for the unearned trophies
// that have an estimate, plus how many unearned trophies have no estimate.
export function remainingEstimate(trophies, earned) {
  let minutes = 0;
  let unknown = 0;
  for (const t of trophies) {
    if (earned.has(t.id)) continue;
    if (typeof t.timeMin === 'number') minutes += t.timeMin;
    else unknown += 1;
  }
  return { minutes, unknown };
}

// trophyById: the trophy with this id, or undefined.
export function trophyById(trophies, id) {
  return trophies.find((t) => t.id === id);
}

// sourceName: the display name of a source key from the document's map.
export function sourceName(doc, key) {
  return doc.sources && doc.sources[key] ? doc.sources[key].name : key;
}

// sourceUrl: the link of a source key from the document's map.
export function sourceUrl(doc, key) {
  return doc.sources && doc.sources[key] ? doc.sources[key].url : '#';
}

// isUnconfirmed: true when no guide has yet confirmed how the trophy unlocks.
// The app shows these with an "unconfirmed" badge and never invents steps.
export function isUnconfirmed(trophy) {
  return trophy.status === 'unconfirmed';
}
