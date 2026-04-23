function createBadgeMarkup(items) {
  return items
    .map((item) => `<span class="badge">${item}</span>`)
    .join("");
}

function formatShortDate(value) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function renderRecommendations(container, results, feedbackMap) {
  if (!results.length) {
    container.innerHTML =
      '<p class="empty-state">Start with a quick check-in and Pocket Uplift will suggest three small actions with simple reasons for why they fit.</p>';
    return;
  }

  container.innerHTML = results
    .map((result) => {
      const feedback = feedbackMap[result.id] || "";
      const didItClass = feedback === "did" ? "feedback-button is-active" : "feedback-button";
      const skipClass = feedback === "skip" ? "feedback-button is-active" : "feedback-button";

      return `
        <article class="result-card">
          <div class="result-header">
            <div>
              <h3>${result.title}</h3>
              <p class="muted">${result.category}</p>
            </div>
            <span class="duration-pill">${result.durationMin} min</span>
          </div>
          <div class="badge-row">${createBadgeMarkup(result.whyBadges)}</div>
          <p class="result-reason">
            <strong>Recommended:</strong>
            ${result.reasonText}
          </p>
          <p class="result-note">
            <strong>What to do:</strong>
            ${result.note}
          </p>
          <div class="feedback-row">
            <button
              class="${didItClass}"
              type="button"
              data-feedback="did"
              data-action-id="${result.id}"
              aria-pressed="${feedback === "did"}"
            >
              Mark as done
            </button>
            <button
              class="${skipClass}"
              type="button"
              data-feedback="skip"
              data-action-id="${result.id}"
              aria-pressed="${feedback === "skip"}"
            >
              Skip for now
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderProgress(container, summary) {
  if (!summary.totalCheckins) {
    container.innerHTML =
      '<p class="empty-state">Your recent pattern will appear after your first check-in. Start with one quick check-in to build a simple local record on this device.</p>';
    return;
  }

  const latestFeedback = summary.latest.feedback || {};
  const didCount = Object.values(latestFeedback).filter((value) => value === "did").length;
  const skippedCount = Object.values(latestFeedback).filter((value) => value === "skip").length;

  const trendMarkup = summary.trend
    .map((day) => {
      const width = `${Math.max(day.averageMood, 0) * 20}%`;
      return `
        <div class="trend-bar">
          <span>${day.label}</span>
          <span class="trend-track"><span class="trend-fill" style="width: ${width}"></span></span>
          <strong>${day.averageMood.toFixed(1)}</strong>
        </div>
      `;
    })
    .join("");

  const historyMarkup = summary.recent
    .map((entry) => {
      return `
        <div class="history-item">
          <div>
            <strong>${formatShortDate(entry.createdAt)}</strong>
            <p class="muted">Mood ${entry.mood}/5 · Energy ${entry.energy}/5 · Stress ${entry.stress}/5</p>
          </div>
          <strong>${entry.contextLabel}</strong>
        </div>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="progress-grid">
      <article class="info-tile">
        <div class="info-header">
          <h3>Current streak</h3>
          <span class="metric-value">${summary.streak} day${summary.streak === 1 ? "" : "s"}</span>
        </div>
        <p class="metric-note">Counts days with at least one check-in.</p>
      </article>
      <article class="info-tile">
        <div class="info-header">
          <h3>Total check-ins</h3>
          <span class="metric-value">${summary.totalCheckins}</span>
        </div>
        <p class="metric-note">A simple record stored only on this device.</p>
      </article>
      <article class="info-tile">
        <div class="info-header">
          <h3>Average mood</h3>
          <span class="metric-value">${summary.averageMood.toFixed(1)}/5</span>
        </div>
        <p class="metric-note">Based on your most recent check-ins.</p>
      </article>
    </div>
    <article class="info-tile">
      <h3>Latest check-in</h3>
      <p class="metric-note">
        ${formatShortDate(summary.latest.createdAt)} · Mood ${summary.latest.mood}/5 · Energy ${summary.latest.energy}/5 · Stress ${summary.latest.stress}/5 · ${summary.latest.contextLabel}
      </p>
      <p class="metric-note">Latest action feedback: ${didCount} completed, ${skippedCount} skipped.</p>
    </article>
    <article class="info-tile">
      <h3>7-day mood view</h3>
      <div class="trend-row">${trendMarkup}</div>
    </article>
    <article class="info-tile">
      <h3>Recent check-ins</h3>
      <div class="history-list">${historyMarkup}</div>
    </article>
  `;
}

function setStatus(element, message) {
  element.textContent = message;
}

function setSliderOutput(input, output) {
  output.textContent = input.value;
}

function applySettingsToDocument(settings) {
  document.body.classList.toggle("high-contrast", Boolean(settings.highContrast));
  document.body.classList.toggle("dyslexia-font", Boolean(settings.dyslexiaFont));
}

window.appUi = {
  applySettingsToDocument,
  renderProgress,
  renderRecommendations,
  setSliderOutput,
  setStatus,
};
