/**
 * Pure stacking-calculation logic for the TFT S17 losing-streak calculator.
 *
 * This module deliberately knows nothing about the DOM, so the domain rules
 * can be reasoned about and tested in isolation from the UI layer (app.js).
 */
const TftCalculator = (() => {
  // Ordered list of stages a losing streak can span.
  const ALL_STAGES = [
    '2-1', '2-2', '2-3', '2-5', '2-6',
    '3-1', '3-2', '3-3', '3-5', '3-6',
    '4-1', '4-2', '4-3', '4-5', '4-6',
  ];

  // Reward thresholds: a reward opens every 100 layers, up to 800.
  const MILESTONES = [100, 200, 300, 400, 500, 600, 700, 800];

  // Layers gained on the nth consecutive loss: 20 base, plus 5 per streak step.
  const perRound = (streak) => 20 + 5 * streak;

  /**
   * Build the per-stage timeline between two stages (inclusive).
   *
   * @param {string} startStage    Stage where the losing streak begins.
   * @param {string} endStage      Last stage to include.
   * @param {number} initStacks    Layers already accumulated beforehand.
   * @param {Set<string>} breakSet Stages where a win breaks the streak.
   * @returns {Array<object>} One row per stage in range, or [] when invalid.
   */
  function calcRows(startStage, endStage, initStacks, breakSet) {
    const si = ALL_STAGES.indexOf(startStage);
    const ei = ALL_STAGES.indexOf(endStage);
    if (si < 0 || ei < 0 || ei < si) return [];

    let total = initStacks;
    let streak = 0;
    const rows = [];

    for (let i = si; i <= ei; i++) {
      const stage = ALL_STAGES[i];
      if (breakSet.has(stage)) {
        streak = 0;
        rows.push({ stage, streak: 0, gained: 0, total, broke: true, ms: [] });
      } else {
        streak++;
        const gained = perRound(streak);
        const prev = total;
        total += gained;
        const ms = MILESTONES.filter((m) => prev < m && total >= m);
        rows.push({ stage, streak, gained, total, broke: false, ms });
      }
    }
    return rows;
  }

  return { ALL_STAGES, MILESTONES, calcRows };
})();
