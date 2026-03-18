const state = {
  actions: [],
  currentEntryId: null,
  currentFeedback: {},
  currentResults: [],
  history: [],
  settings: window.appStorage.loadSettings(),
};

const elements = {
  checkinForm: document.getElementById("checkin-form"),
  contextOptions: document.getElementById("context-options"),
  contrastToggle: document.getElementById("contrast-toggle"),
  fontToggle: document.getElementById("font-toggle"),
  mood: document.getElementById("mood"),
  moodValue: document.getElementById("mood-value"),
  energy: document.getElementById("energy"),
  energyValue: document.getElementById("energy-value"),
  stress: document.getElementById("stress"),
  stressValue: document.getElementById("stress-value"),
  progressRoot: document.getElementById("progress-root"),
  recommendRoot: document.getElementById("recommend-root"),
  resetBtn: document.getElementById("reset-btn"),
  statusMessage: document.getElementById("status-message"),
};

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `entry-${Date.now()}`;
}

function parseCsv(text) {
  const [headerLine, ...rows] = text.trim().split(/\r?\n/);
  if (!headerLine) {
    return [];
  }

  return rows.map((row) => {
    const values = row.split(",");

    return {
      id: values[0],
      title: values[1],
      category: values[2],
      durationMin: Number(values[3]),
      tags: values[4].split("|").filter(Boolean),
      goodForMood: Number(values[5]),
      goodForEnergy: Number(values[6]),
      goodForStress: Number(values[7]),
      contexts: values[8].split("|").filter(Boolean),
      note: values[9],
      link: values[10] || "",
    };
  });
}

function getSelectedContext() {
  const active = elements.contextOptions.querySelector(".context-chip.is-selected");
  return active ? active.dataset.context : "any";
}

function getContextLabel(context) {
  if (context === "any") {
    return "Any";
  }

  return context.charAt(0).toUpperCase() + context.slice(1);
}

function buildCheckin() {
  return {
    mood: Number(elements.mood.value),
    energy: Number(elements.energy.value),
    stress: Number(elements.stress.value),
    context: getSelectedContext(),
  };
}

function applyDraft(draft) {
  if (!draft) {
    return;
  }

  elements.mood.value = draft.mood ?? 3;
  elements.energy.value = draft.energy ?? 3;
  elements.stress.value = draft.stress ?? 3;

  setActiveContext(draft.context || "any");
}

function updateSliderOutputs() {
  window.appUi.setSliderOutput(elements.mood, elements.moodValue);
  window.appUi.setSliderOutput(elements.energy, elements.energyValue);
  window.appUi.setSliderOutput(elements.stress, elements.stressValue);
}

function setActiveContext(context) {
  const chips = elements.contextOptions.querySelectorAll(".context-chip");
  chips.forEach((chip) => {
    const isActive = chip.dataset.context === context;
    chip.classList.toggle("is-selected", isActive);
    chip.setAttribute("aria-pressed", String(isActive));
  });
}

function saveDraftFromForm() {
  window.appStorage.saveDraft(buildCheckin());
}

function buildHistorySummary(history) {
  if (!history.length) {
    return {
      averageMood: null,
      latest: null,
      recent: [],
      streak: 0,
      totalCheckins: 0,
      trend: [],
    };
  }

  const recent = history.slice(0, 4).map((entry) => ({
    ...entry,
    contextLabel: getContextLabel(entry.context),
  }));

  const recentMoodWindow = history.slice(0, 7);
  const averageMood =
    recentMoodWindow.reduce((sum, entry) => sum + entry.mood, 0) / recentMoodWindow.length;

  const groups = new Map();
  history.forEach((entry) => {
    const dayKey = entry.createdAt.slice(0, 10);
    const existing = groups.get(dayKey) || [];
    existing.push(entry);
    groups.set(dayKey, existing);
  });

  const trend = Array.from(groups.entries())
    .slice(0, 7)
    .map(([dayKey, entries]) => {
      const totalMood = entries.reduce((sum, entry) => sum + entry.mood, 0);

      return {
        averageMood: totalMood / entries.length,
        label: new Date(dayKey).toLocaleDateString("en-GB", { weekday: "short" }),
      };
    });

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!groups.has(key)) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    averageMood,
    latest: recent[0],
    recent,
    streak,
    totalCheckins: history.length,
    trend,
  };
}

function renderProgress() {
  window.appUi.renderProgress(elements.progressRoot, buildHistorySummary(state.history));
}

function renderResults() {
  window.appUi.renderRecommendations(
    elements.recommendRoot,
    state.currentResults,
    state.currentFeedback
  );
}

function syncSettingsToUi() {
  elements.contrastToggle.checked = Boolean(state.settings.highContrast);
  elements.fontToggle.checked = Boolean(state.settings.dyslexiaFont);
  window.appUi.applySettingsToDocument(state.settings);
}

function saveSettings() {
  state.settings = {
    dyslexiaFont: Boolean(elements.fontToggle.checked),
    highContrast: Boolean(elements.contrastToggle.checked),
  };

  window.appStorage.saveSettings(state.settings);
  syncSettingsToUi();
}

function updateCurrentEntryFeedback(actionId, feedback) {
  state.currentFeedback = {
    ...state.currentFeedback,
    [actionId]: feedback,
  };

  state.history = window.appStorage.recordFeedback(state.currentEntryId, actionId, feedback);
  renderResults();
  renderProgress();
  window.appUi.setStatus(
    elements.statusMessage,
    feedback === "did"
      ? "Saved. Nice work logging that action."
      : "Saved. That action was skipped this time."
  );
}

async function loadActions() {
  const response = await fetch("data/micro_actions.csv");
  if (!response.ok) {
    throw new Error("Could not load the micro-actions dataset.");
  }

  const csvText = await response.text();
  state.actions = parseCsv(csvText);
}

function buildHistoryEntry(checkin, results) {
  return {
    id: createId(),
    createdAt: new Date().toISOString(),
    mood: checkin.mood,
    energy: checkin.energy,
    stress: checkin.stress,
    context: checkin.context,
    feedback: {},
    results: results.map((result) => result.id),
  };
}

function handleSubmit(event) {
  event.preventDefault();

  const checkin = buildCheckin();
  const results = window.recommendTop3(state.actions, checkin, 3);
  const historyEntry = buildHistoryEntry(checkin, results);

  state.currentEntryId = historyEntry.id;
  state.currentResults = results;
  state.currentFeedback = {};
  state.history = window.appStorage.appendHistoryEntry(historyEntry);

  saveDraftFromForm();
  renderResults();
  renderProgress();
  window.appUi.setStatus(elements.statusMessage, "Top 3 recommendations updated.");
}

function handleReset() {
  window.appStorage.resetAllData();
  state.history = [];
  state.currentEntryId = null;
  state.currentResults = [];
  state.currentFeedback = {};
  state.settings = window.appStorage.loadSettings();

  elements.mood.value = 3;
  elements.energy.value = 3;
  elements.stress.value = 3;
  setActiveContext("any");
  updateSliderOutputs();
  syncSettingsToUi();
  renderResults();
  renderProgress();
  window.appUi.setStatus(elements.statusMessage, "Local Pocket Uplift data has been reset.");
}

function bindEvents() {
  [elements.mood, elements.energy, elements.stress].forEach((input) => {
    input.addEventListener("input", () => {
      updateSliderOutputs();
      saveDraftFromForm();
    });
  });

  elements.contextOptions.addEventListener("click", (event) => {
    const chip = event.target.closest(".context-chip");
    if (!chip) {
      return;
    }

    setActiveContext(chip.dataset.context);
    saveDraftFromForm();
  });

  elements.recommendRoot.addEventListener("click", (event) => {
    const button = event.target.closest("[data-feedback]");
    if (!button || !state.currentEntryId) {
      return;
    }

    updateCurrentEntryFeedback(button.dataset.actionId, button.dataset.feedback);
  });

  elements.contrastToggle.addEventListener("change", saveSettings);
  elements.fontToggle.addEventListener("change", saveSettings);
  elements.checkinForm.addEventListener("submit", handleSubmit);
  elements.resetBtn.addEventListener("click", handleReset);
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register("../pwa/service-worker.js", {
      scope: "../",
    });
  } catch (error) {
    console.warn("Service worker registration failed", error);
  }
}

async function init() {
  try {
    state.history = window.appStorage.loadHistory();
    applyDraft(window.appStorage.loadDraft());
    updateSliderOutputs();
    syncSettingsToUi();
    bindEvents();
    renderProgress();
    renderResults();
    await loadActions();
    await registerServiceWorker();
  } catch (error) {
    console.error(error);
    window.appUi.setStatus(
      elements.statusMessage,
      "The app needs to be opened through a local server so the dataset can load."
    );
  }
}

document.addEventListener("DOMContentLoaded", init);
