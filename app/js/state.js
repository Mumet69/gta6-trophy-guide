// Progress and settings, saved in this browser only (localStorage). Nothing
// leaves the machine: export writes a file, import reads one the user picks.
const PROGRESS_KEY = 'gta6-trophy-guide-progress-v1';
const SPOILER_KEY = 'gta6-trophy-guide-spoilers-v1';

// loadProgress: the set of earned trophy ids, from localStorage.
export function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(ids) ? ids.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

// saveProgress: writes the earned set back to localStorage.
export function saveProgress(earned) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

// loadSpoilers: true when hidden trophies stay masked until earned (default on).
export function loadSpoilers() {
  const raw = localStorage.getItem(SPOILER_KEY);
  return raw === null ? true : raw === '1';
}

// saveSpoilers: remembers the spoiler setting.
export function saveSpoilers(on) {
  localStorage.setItem(SPOILER_KEY, on ? '1' : '0');
}

// exportProgress: downloads the earned ids as a JSON file.
export function exportProgress(earned) {
  const blob = new Blob(
    [JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b) }, null, 2)],
    { type: 'application/json' },
  );
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

// importProgress: reads an exported file and returns the earned ids it holds.
export async function importProgress(file, validIds) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('not a progress file');
  return new Set(ids.filter((n) => Number.isInteger(n) && validIds.has(n)));
}
