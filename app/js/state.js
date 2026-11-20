// Progress and settings, saved in this browser only (localStorage). Nothing
// leaves the machine: export writes a file, import reads one the user picks.
// v2: the toolbar state (sort, difficulty and status filters) is remembered
// too, and exports now carry a version stamp so old files stay readable.
const PROGRESS_KEY = 'gta6-trophy-guide-progress-v1';
const SPOILER_KEY = 'gta6-trophy-guide-spoilers-v1';
const VIEW_KEY = 'gta6-trophy-guide-view-v2';

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

// resetProgress: clears the earned set (the user confirms first in the UI).
export function resetProgress() {
  localStorage.removeItem(PROGRESS_KEY);
  return new Set();
}

// progressSummary: a one-line "12 of 55 earned" summary for confirm dialogs.
export function progressSummary(earned, total) {
  return `${earned.size} of ${total} trophies earned`;
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

// loadView: the remembered toolbar state (sort + filters), or defaults.
export function loadView() {
  try {
    const parsed = JSON.parse(localStorage.getItem(VIEW_KEY) || '{}');
    return {
      sort: typeof parsed.sort === 'string' ? parsed.sort : 'default',
      difficulty: typeof parsed.difficulty === 'string' ? parsed.difficulty : 'all',
      status: typeof parsed.status === 'string' ? parsed.status : 'all',
    };
  } catch {
    return { sort: 'default', difficulty: 'all', status: 'all' };
  }
}

// saveView: remembers the toolbar state.
export function saveView(view) {
  try {
    localStorage.setItem(VIEW_KEY, JSON.stringify(view));
  } catch {
    // Private mode can refuse storage; the guide still works without it.
  }
}

// exportProgress: downloads the earned ids as a JSON file.
export function exportProgress(earned) {
  const blob = new Blob(
    [JSON.stringify({ game: 'Grand Theft Auto VI', version: 2, earned: [...earned].sort((a, b) => a - b) }, null, 2)],
    { type: 'application/json' },
  );
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

// importProgress: reads an exported file and returns the earned ids it holds.
// Accepts both v1 files (a bare array or {earned}) and v2 files ({version, earned}).
export async function importProgress(file, validIds) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('not a progress file');
  return new Set(ids.filter((n) => Number.isInteger(n) && validIds.has(n)));
}
