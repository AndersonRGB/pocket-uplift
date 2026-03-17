function scoreForLowState(value) {
  return 6 - Number(value || 3);
}

function makeContextBadge(context) {
  if (!context || context === "any") {
    return "";
  }

  return `fits ${context}`;
}

function addBadge(badges, badge) {
  if (badge && !badges.includes(badge)) {
    badges.push(badge);
  }
}

function scoreAction(action, checkin) {
  const badges = [];
  let score = 0;

  const lowMoodWeight = scoreForLowState(checkin.mood);
  const lowEnergyWeight = scoreForLowState(checkin.energy);
  const stressWeight = Number(checkin.stress || 3);
  const context = checkin.context || "any";

  score += action.goodForMood * lowMoodWeight;
  score += action.goodForEnergy * lowEnergyWeight;
  score += action.goodForStress * stressWeight;

  if (action.goodForStress >= 4 && checkin.stress >= 3) {
    addBadge(badges, "good for stress");
  }

  if (action.goodForEnergy >= 4 && checkin.energy <= 3) {
    addBadge(badges, "energy boost");
  }

  if (action.goodForMood >= 4 && checkin.mood <= 3) {
    addBadge(badges, "gentle mood lift");
  }

  if (action.tags.includes("quiet")) {
    score += 2;
    addBadge(badges, "quiet");
  }

  if (action.durationMin <= 5) {
    score += 2;
  } else if (action.durationMin <= 10) {
    score += 1;
  }
  addBadge(badges, `${action.durationMin} min`);

  if (context !== "any" && action.contexts.includes(context)) {
    score += 5;
    addBadge(badges, makeContextBadge(context));
  }

  if (checkin.energy >= 4 && action.tags.includes("movement")) {
    score += 2;
  }

  if (checkin.stress >= 4 && action.tags.includes("breathing")) {
    score += 3;
  }

  if (checkin.context === "study" && action.tags.includes("study")) {
    addBadge(badges, "fits study");
  }

  if (checkin.context === "sleep" && action.tags.includes("sleep")) {
    addBadge(badges, "fits sleep");
  }

  if (checkin.context === "social" && action.tags.includes("social")) {
    addBadge(badges, "fits social");
  }

  if (checkin.context === "outdoors" && action.tags.includes("outdoors")) {
    addBadge(badges, "fits outdoors");
  }

  return {
    ...action,
    score,
    whyBadges: badges.slice(0, 4),
  };
}

function recommendTop3(actions, checkin, limit = 3) {
  if (!Array.isArray(actions) || !actions.length) {
    return [];
  }

  return actions
    .map((action) => scoreAction(action, checkin))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.durationMin - right.durationMin;
    })
    .slice(0, limit);
}

window.recommendTop3 = recommendTop3;
