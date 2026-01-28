function recommendTop3(actions, context, limit = 3) {
  if (!Array.isArray(actions) || actions.length === 0) {
    return [];
  }

  const mood = Number(context.mood || 3);
  const energy = Number(context.energy || 3);
  const stress = Number(context.stress || 3);
  const selectedTags = new Set(context.tags || []);

  const results = actions.map((action) => {
    const reasons = [];
    let score = 0;

    const actionTags = new Set(action.tags || []);
    selectedTags.forEach((tag) => {
      if (actionTags.has(tag)) {
        score += 2;
        reasons.push(`Matches ${tag}`);
      }
    });

    if (energy <= 2 && action.energy <= 2) {
      score += 2;
      reasons.push("Low-energy friendly");
    } else if (energy >= 4 && action.energy >= 3) {
      score += 2;
      reasons.push("Uses your energy");
    }

    if (stress >= 4 && (actionTags.has("calm") || actionTags.has("breath"))) {
      score += 2;
      reasons.push("Stress relief");
    }

    if (mood <= 2 && (actionTags.has("uplift") || actionTags.has("gratitude"))) {
      score += 2;
      reasons.push("Mood boost");
    }

    if (action.minutes <= 10) {
      score += 1;
      reasons.push("Quick to do");
    }

    score += action.impact * 0.3;

    return {
      action,
      score,
      reasons: Array.from(new Set(reasons)).slice(0, 3),
    };
  });

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

window.recommendTop3 = recommendTop3;