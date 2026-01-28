const STORAGE_KEY = "pocket-uplift-state";

function safeParse(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn("Unable to parse stored state", error);
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Unable to save state", error);
  }
}

function loadState() {
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

function resetState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Unable to reset state", error);
  }
}

window.appStorage = {
  saveState,
  loadState,
  resetState,
};