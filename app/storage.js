const STORAGE_KEY = "pocket-uplift-state";

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function resetState() {
  localStorage.removeItem(STORAGE_KEY);
}

window.appStorage = {
  saveState,
  loadState,
  resetState,
};