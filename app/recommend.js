function scoreForLowState(value) {
  return 6 - Number(value || 3);
}

function hasAnyTag(action, tags) {
  return tags.some((tag) => action.tags.includes(tag));
}

function countSharedTags(left, right) {
  return left.tags.filter((tag) => right.tags.includes(tag)).length;
}

function addBadge(badges, badge) {
  if (badge && !badges.includes(badge)) {
    badges.push(badge);
  }
}

function getContextReason(context) {
  const labels = {
    any: "this moment",
    study: "a study session",
    sleep: "winding down",
    social: "a social moment",
    outdoors: "an outdoor break",
  };

  return labels[context] || "this moment";
}

function getContextBadge(context) {
  const labels = {
    study: "Fits study",
    sleep: "Fits winding down",
    social: "Fits social",
    outdoors: "Fits outdoor time",
  };

  return labels[context] || "";
}

function buildReasonSentence(action, checkin, badges) {
  const reasons = [];

  if (checkin.stress >= 4 && action.goodForStress >= 4) {
    reasons.push("stress is high");
  }

  if (checkin.energy <= 2 && action.goodForEnergy >= 3) {
    reasons.push("energy is low");
  }

  if (checkin.mood <= 2 && action.goodForMood >= 4) {
    reasons.push("mood is low");
  }

  if (checkin.context !== "any" && action.contexts.includes(checkin.context)) {
    reasons.push(`it fits ${getContextReason(checkin.context)}`);
  }

  if (action.durationMin <= 5) {
    reasons.push("it is short");
  }

  if (hasAnyTag(action, ["quiet", "breathing", "grounding", "calm"])) {
    reasons.push("it offers a calm reset");
  }

  if (!reasons.length && badges.length) {
    reasons.push(`it matches this check-in through ${badges[0].toLowerCase()}`);
  }

  if (!reasons.length) {
    return "Because it is a gentle option for your current check-in.";
  }

  if (reasons.length === 1) {
    return `Because ${reasons[0]}.`;
  }

  if (reasons.length === 2) {
    return `Because ${reasons[0]} and ${reasons[1]}.`;
  }

  return `Because ${reasons[0]}, ${reasons[1]}, and ${reasons[2]}.`;
}

function scoreAction(action, checkin) {
  const badges = [];
  let score = 0;

  const lowMoodWeight = scoreForLowState(checkin.mood);
  const lowEnergyWeight = scoreForLowState(checkin.energy);
  const stressWeight = Number(checkin.stress || 3);
  const context = checkin.context || "any";
  const isCalming = hasAnyTag(action, ["quiet", "breathing", "grounding", "calm", "sleep"]);
  const isActive = hasAnyTag(action, ["movement", "outdoors"]);
  const isBreathing = action.tags.includes("breathing");
  const isGrounding = action.tags.includes("grounding");
  const isOutdoors = action.tags.includes("outdoors");
  const exactContextMatch = context !== "any" && action.contexts.includes(context);

  score += action.goodForMood * lowMoodWeight;
  score += action.goodForEnergy * lowEnergyWeight;
  score += action.goodForStress * stressWeight;

  if (action.goodForStress >= 4 && checkin.stress >= 3) {
    addBadge(badges, "Good for stress");
  }

  if (action.goodForEnergy >= 4 && checkin.energy <= 3) {
    addBadge(badges, "Energy boost");
  }

  if (action.goodForMood >= 4 && checkin.mood <= 3) {
    addBadge(badges, "Gentle mood lift");
  }

  if (isCalming) {
    score += 1;
    addBadge(badges, "Quiet");
  }

  if (isGrounding && checkin.stress >= 4) {
    score += 2;
  } else if (isGrounding && checkin.stress === 3) {
    score += 1;
  } else if (isGrounding && checkin.stress <= 2) {
    score -= 1;
  }

  if (action.durationMin <= 5) {
    score += 2;
  } else if (action.durationMin <= 10) {
    score += 1;
  }

  if (checkin.stress >= 4) {
    if (action.durationMin <= 5) {
      score += 3;
    }

    if (isCalming) {
      score += 4;
    }

    if (isBreathing) {
      score += 1;
    }
  }

  if (checkin.stress <= 2 && isBreathing) {
    score -= 2;
  }

  if (checkin.energy <= 2) {
    if (isCalming) {
      score += 3;
    }

    if (isActive) {
      score -= 2;
    }
  }

  if (checkin.energy >= 4 && isActive) {
    score += 2;
  }

  if (checkin.mood <= 2 && hasAnyTag(action, ["uplift", "social", "creative", "outdoors"])) {
    score += 2;
  }

  if (exactContextMatch) {
    score += 5;
    addBadge(badges, getContextBadge(context));
  }

  if (context === "study" && hasAnyTag(action, ["study", "focus"])) {
    score += exactContextMatch ? 1 : 2;
    if (!exactContextMatch) {
      addBadge(badges, "Supports focus");
    }
  }

  if (context === "sleep" && hasAnyTag(action, ["sleep", "calm"])) {
    score += exactContextMatch ? 1 : 3;
    if (!exactContextMatch) {
      addBadge(badges, "Supports winding down");
    }
  }

  if (context === "social" && action.tags.includes("social")) {
    score += exactContextMatch ? 1 : 2;
    if (!exactContextMatch) {
      addBadge(badges, "Social-friendly");
    }
  }

  if (context === "outdoors" && action.tags.includes("outdoors")) {
    score += exactContextMatch ? 4 : 3;
    if (!exactContextMatch) {
      addBadge(badges, "Good outdoors");
    }
  }

  if (context === "outdoors" && !isOutdoors) {
    score -= 3;
  }

  if (context === "sleep" && isActive && !action.tags.includes("sleep")) {
    score -= 5;
  }

  addBadge(badges, `${action.durationMin} min`);

  return {
    ...action,
    reasonText: buildReasonSentence(action, checkin, badges),
    score,
    whyBadges: badges.slice(0, 4),
  };
}

function selectDiverseResults(scoredActions, limit) {
  const selected = [];
  const remaining = [...scoredActions];

  while (selected.length < limit && remaining.length) {
    let bestIndex = 0;
    let bestAdjustedScore = -Infinity;

    remaining.forEach((candidate, index) => {
      const diversityPenalty = selected.reduce((total, chosen) => {
        let penalty = total;

        if (candidate.category === chosen.category) {
          penalty += 4;
        }

        if (countSharedTags(candidate, chosen) >= 2) {
          penalty += 2;
        }

        return penalty;
      }, 0);

      const adjustedScore = candidate.score - diversityPenalty;

      if (adjustedScore > bestAdjustedScore) {
        bestAdjustedScore = adjustedScore;
        bestIndex = index;
      }
    });

    selected.push(remaining.splice(bestIndex, 1)[0]);
  }

  return selected;
}

function recommendTop3(actions, checkin, limit = 3) {
  if (!Array.isArray(actions) || !actions.length) {
    return [];
  }

  const scoredActions = actions
    .map((action) => scoreAction(action, checkin))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.durationMin - right.durationMin;
    });

  return selectDiverseResults(scoredActions, limit);
}

window.recommendTop3 = recommendTop3;
