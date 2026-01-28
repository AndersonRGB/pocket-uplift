const state = {
  actions: [],
};

const elements = {
  mood: document.getElementById("mood"),
  energy: document.getElementById("energy"),
  stress: document.getElementById("stress"),
  moodValue: document.getElementById("mood-value"),
  energyValue: document.getElementById("energy-value"),
  stressValue: document.getElementById("stress-value"),
  chipRow: document.getElementById("context-chips"),
  recommendBtn: document.getElementById("recommend-btn"),
  resetBtn: document.getElementById("reset-btn"),
  results: document.getElementById("recommend-root"),
};

function setSliderValue(element, valueEl) {
  valueEl.textContent = element.value;
}

function getSelectedTags() {
  const chips = elements.chipRow.querySelectorAll(".chip");
  return Array.from(chips)
    .filter((chip) => chip.getAttribute("aria-pressed") === "true")
    .map((chip) => chip.dataset.tag);
}

function toggleChip(chip) {
  const isPressed = chip.getAttribute("aria-pressed") === "true";
  chip.setAttribute("aria-pressed", String(!isPressed));
}

function buildContext() {
  return {
    mood: Number(elements.mood.value),
    energy: Number(elements.energy.value),
    stress: Number(elements.stress.value),
    tags: getSelectedTags(),
  };
}

function saveCheckin(context) {
  window.appStorage.saveState({
    ...context,
    savedAt: new Date().toISOString(),
  });
}

function loadCheckin() {
  const saved = window.appStorage.loadState();
  if (!saved) {
    return;
  }

  elements.mood.value = saved.mood ?? 3;
  elements.energy.value = saved.energy ?? 3;
  elements.stress.value = saved.stress ?? 3;

  setSliderValue(elements.mood, elements.moodValue);
  setSliderValue(elements.energy, elements.energyValue);
  setSliderValue(elements.stress, elements.stressValue);

  const selected = new Set(saved.tags || []);
  const chips = elements.chipRow.querySelectorAll(".chip");
  chips.forEach((chip) => {
    chip.setAttribute("aria-pressed", String(selected.has(chip.dataset.tag)));
  });
}

function renderResults(results) {
  if (!results.length) {
    elements.results.innerHTML =
      '<p class="muted">No matches yet. Try adjusting your check-in.</p>';
    return;
  }

  elements.results.innerHTML = results
    .map((result) => {
      const { action, reasons } = result;
      const badges = reasons.map((reason) => `<span class="badge">${reason}</span>`).join("");

      return `
        <article class="result-card">
          <div class="result-title">
            <span>${action.title}</span>
            <span>${action.minutes} min</span>
          </div>
          <div class="meta">${action.category} · Energy ${action.energy}/5 · Impact ${action.impact}/5</div>
          <div class="badges">${badges}</div>
          <p class="meta">${action.notes}</p>
        </article>
      `;
    })
    .join("");
}

function handleRecommend() {
  const context = buildContext();
  saveCheckin(context);

  const results = window.recommendTop3(state.actions, context, 3);
  renderResults(results);
}

function handleReset() {
  window.appStorage.resetState();

  elements.mood.value = 3;
  elements.energy.value = 3;
  elements.stress.value = 3;

  setSliderValue(elements.mood, elements.moodValue);
  setSliderValue(elements.energy, elements.energyValue);
  setSliderValue(elements.stress, elements.stressValue);

  const chips = elements.chipRow.querySelectorAll(".chip");
  chips.forEach((chip) => chip.setAttribute("aria-pressed", "false"));

  elements.results.innerHTML = '<p class="muted">Complete your check-in to see recommendations.</p>';
}

function parseCsv(text) {
  const rows = text.trim().split(/\r?\n/);
  const header = rows.shift();
  if (!header) {
    return [];
  }

  return rows.map((row) => {
    const values = row.split(",");
    return {
      action_id: values[0],
      title: values[1],
      category: values[2],
      minutes: Number(values[3]),
      energy: Number(values[4]),
      impact: Number(values[5]),
      tags: values[6] ? values[6].split("|").map((tag) => tag.trim()) : [],
      notes: values[7] || "",
    };
  });
}

async function loadActions() {
  try {
    const response = await fetch("data/micro_actions.csv");
    if (!response.ok) {
      throw new Error("Unable to load micro actions");
    }
    const text = await response.text();
    state.actions = parseCsv(text);
  } catch (error) {
    console.error(error);
    state.actions = [];
    elements.results.innerHTML =
      '<p class="muted">Unable to load actions. Please check your connection.</p>';
  }
}

function bindEvents() {
  elements.mood.addEventListener("input", () => setSliderValue(elements.mood, elements.moodValue));
  elements.energy.addEventListener("input", () =>
    setSliderValue(elements.energy, elements.energyValue)
  );
  elements.stress.addEventListener("input", () => setSliderValue(elements.stress, elements.stressValue));

  elements.chipRow.addEventListener("click", (event) => {
    if (event.target.classList.contains("chip")) {
      toggleChip(event.target);
    }
  });

  elements.recommendBtn.addEventListener("click", handleRecommend);
  elements.resetBtn.addEventListener("click", handleReset);
}

document.addEventListener("DOMContentLoaded", async () => {
  setSliderValue(elements.mood, elements.moodValue);
  setSliderValue(elements.energy, elements.energyValue);
  setSliderValue(elements.stress, elements.stressValue);

  loadCheckin();
  bindEvents();
  await loadActions();
});