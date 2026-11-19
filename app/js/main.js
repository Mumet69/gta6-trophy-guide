// Boot: loads the trophy list, wires the toolbar and tabs, and keeps the
// checklist, the guide pane and the progress bar in sync. Screenshot views
// are driven by query parameters (?view=roadmap&spoilers=off&trophy=28).
import { loadTrophyData } from './data.js';
import { loadProgress, saveProgress, loadSpoilers, saveSpoilers, exportProgress, importProgress } from './state.js';
import { renderTrophyList, renderTrophyDetail, updateProgressBar } from './render.js';
import { renderRoadmap, renderMissables, renderSources } from './roadmap.js';

const VIEWS = ['tracker', 'roadmap', 'missables', 'sources'];

const doc = await loadTrophyData();
const trophies = doc.trophies;
const validIds = new Set(trophies.map((t) => t.id));
let earned = loadProgress();
let spoilersOn = loadSpoilers();
let selectedId = null;
let currentView = 'tracker';

const filters = {
  search: '',
  kind: 'all',
  grade: 'all',
  earnedOnly: false,
  earned,
};

function refresh() {
  updateProgressBar(trophies, earned);
  renderTrophyList(trophies, doc, earned, spoilersOn, filters, selectedId, selectTrophy, toggleEarned);
  const selected = selectedId ? trophies.find((t) => t.id === selectedId) : null;
  renderTrophyDetail(selected, doc, earned, spoilersOn, toggleEarned);
  renderRoadmap(trophies, earned, selectTrophy);
  renderMissables(trophies, earned, selectTrophy);
  renderSources(doc);
  document.getElementById('missable-count').textContent = String(trophies.filter((t) => t.missable).length);
}

function selectTrophy(id) {
  selectedId = id;
  showView('tracker');
  refresh();
  document.getElementById('detail-pane').scrollIntoView({ block: 'nearest' });
}

function toggleEarned(id, on) {
  if (on) earned.add(id);
  else earned.delete(id);
  saveProgress(earned);
  refresh();
}

function showView(view) {
  if (!VIEWS.includes(view)) view = 'tracker';
  currentView = view;
  for (const v of VIEWS) {
    document.getElementById(`${v}-view`).hidden = v !== view;
    document.getElementById(`tab-${v}`).classList.toggle('active', v === view);
  }
  document.getElementById('toolbar').style.display = view === 'tracker' ? '' : 'none';
}

// Wire the tabs.
for (const v of VIEWS) {
  document.getElementById(`tab-${v}`).addEventListener('click', () => showView(v));
}

// Wire the toolbar.
document.getElementById('search-input').addEventListener('input', (e) => {
  filters.search = e.target.value;
  refresh();
});
document.getElementById('kind-filter').addEventListener('change', (e) => {
  filters.kind = e.target.value;
  refresh();
});
document.getElementById('grade-filter').addEventListener('change', (e) => {
  filters.grade = e.target.value;
  refresh();
});
document.getElementById('spoiler-toggle').addEventListener('change', (e) => {
  spoilersOn = e.target.checked;
  saveSpoilers(spoilersOn);
  refresh();
});
document.getElementById('earned-only').addEventListener('change', (e) => {
  filters.earnedOnly = e.target.checked;
  refresh();
});
document.getElementById('export-btn').addEventListener('click', () => exportProgress(earned));
document.getElementById('import-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    earned = await importProgress(file, validIds);
    saveProgress(earned);
    refresh();
  } catch {
    alert('That file is not a trophy progress export from this guide.');
  }
  e.target.value = '';
});

// Query parameters: ?view=roadmap|missables|sources, ?spoilers=off, ?trophy=28.
const params = new URLSearchParams(location.search);
if (params.get('spoilers') === 'off') spoilersOn = false;
if (params.get('spoilers') === 'on') spoilersOn = true;
document.getElementById('spoiler-toggle').checked = spoilersOn;
const wanted = Number(params.get('trophy'));
if (validIds.has(wanted)) selectedId = wanted;
refresh();
showView(params.get('view') || 'tracker');
