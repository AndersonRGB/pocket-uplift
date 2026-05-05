const STORAGE_KEYS = {
  draft: "pocket-uplift-draft",
  history: "pocket-uplift-history",
  settings: "pocket-uplift-settings",
};

const DEFAULT_SETTINGS = {
  dyslexiaFont: false,
  highContrast: false,
};

function readJson(key, fallbackValue) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallbackValue;
  } catch (error) {
    console.warn(`Unable to read ${key}`, error);
    return fallbackValue;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Unable to write ${key}`, error);
  }
}

function loadDraft() {
  return readJson(STORAGE_KEYS.draft, null);
}

function saveDraft(draft) {
  writeJson(STORAGE_KEYS.draft, draft);
}

function clearDraft() {
  localStorage.removeItem(STORAGE_KEYS.draft);
}

function loadHistory() {
  return readJson(STORAGE_KEYS.history, []);
}

function saveHistory(history) {
  writeJson(STORAGE_KEYS.history, history.slice(0, 30));
}

function appendHistoryEntry(entry) {
  const history = loadHistory();
  history.unshift(entry);
  saveHistory(history);
  return history.slice(0, 30);
}

function recordFeedback(entryId, actionId, feedback) {
  const history = loadHistory().map((entry) => {
    if (entry.id !== entryId) {
      return entry;
    }

    return {
      ...entry,
      feedback: {
        ...entry.feedback,
        [actionId]: feedback,
      },
    };
  });

  saveHistory(history);
  return history;
}

function loadSettings() {
  return {
    ...DEFAULT_SETTINGS,
    ...readJson(STORAGE_KEYS.settings, {}),
  };
}

function saveSettings(settings) {
  writeJson(STORAGE_KEYS.settings, {
    ...DEFAULT_SETTINGS,
    ...settings,
  });
}

function resetAllData() {
  localStorage.removeItem(STORAGE_KEYS.draft);
  localStorage.removeItem(STORAGE_KEYS.history);
  localStorage.removeItem(STORAGE_KEYS.settings);
}

window.appStorage = {
  appendHistoryEntry,
  clearDraft,
  loadDraft,
  loadHistory,
  loadSettings,
  recordFeedback,
  resetAllData,
  saveDraft,
  saveHistory,
  saveSettings,
};
