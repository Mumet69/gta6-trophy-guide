// loadTrophyData: fetches app/data/trophies.json (the official 55, each with
// its own-words guide and sources) and hands back the parsed document.
export async function loadTrophyData() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('could not load data/trophies.json');
  const doc = await response.json();
  return doc.trophies ? doc : { ...doc, trophies: doc };
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
