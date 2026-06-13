/**
 * UI layer: wires the settings form to the DOM, renders the results and
 * manages the list of "break" stages. All calculation lives in calculator.js
 * (loaded first), keeping presentation and domain logic apart.
 */
(() => {
  const { ALL_STAGES, MILESTONES, calcRows } = TftCalculator;

  // Stages the user expects to win on, which break the losing streak.
  let breaks = [];

  // ── Presentation helpers ──────────────────────────────────────────────────
  function tierClass(stage) {
    if (stage[0] === '2') return 't2';
    if (stage[0] === '3') return 't3';
    return 't4';
  }
  function tierColour(stage) {
    if (stage[0] === '2') return '#56d364';
    if (stage[0] === '3') return '#e3b341';
    return '#ff7b72';
  }

  // ── Break management ────────────────────────────────────────────────────────
  function addBreak() {
    const v = document.getElementById('breakInput').value;
    if (!breaks.includes(v)) { breaks.push(v); renderBreaks(); }
  }
  function removeBreak(stage) {
    breaks = breaks.filter((x) => x !== stage);
    renderBreaks();
  }
  function clearBreaks() {
    breaks = [];
    renderBreaks();
  }
  function renderBreaks() {
    document.getElementById('breakList').innerHTML = breaks.map((s) =>
      `<div class="break-tag">Stage ${s}
         <button class="break-remove" data-stage="${s}" title="移除">✕</button>
       </div>`
    ).join('');
  }

  // ── Render results ──────────────────────────────────────────────────────────
  function run() {
    const startStage = document.getElementById('startStage').value;
    const endStage   = document.getElementById('endStage').value;
    const initStacks = Math.max(0, parseInt(document.getElementById('initStacks').value, 10) || 0);
    const breakSet   = new Set(breaks);

    const rows = calcRows(startStage, endStage, initStacks, breakSet);
    if (!rows.length) return;

    // Map each milestone to the first row that reaches it.
    const msHit = {};
    rows.forEach((r) => r.ms.forEach((m) => { if (!msHit[m]) msHit[m] = r; }));

    // Milestone grid
    document.getElementById('msGrid').innerHTML = MILESTONES.map((m) => {
      const h = msHit[m];
      if (h) {
        return `<div class="ms-card hit">
          <div class="ms-layer">${m} 層</div>
          <div class="ms-num">✓</div>
          <div class="ms-stage">Stage ${h.stage}</div>
          <div class="ms-at">累計 ${h.total} 層</div>
        </div>`;
      }
      return `<div class="ms-card miss">
        <div class="ms-layer">${m} 層</div>
        <div class="ms-num">—</div>
        <div class="ms-stage">未達到</div>
      </div>`;
    }).join('');

    // Summary bar
    const finalRow = rows[rows.length - 1];
    const totalLoss = rows.filter((r) => !r.broke).length;
    const totalWin  = rows.filter((r) => r.broke).length;
    const reached = MILESTONES.filter((m) => msHit[m]).length;
    document.getElementById('summaryBar').innerHTML =
      `<div class="sbar-item">最終累積：<span class="highlight">${finalRow.total} 層</span></div>
       <div class="sbar-item">落敗場次：<span>${totalLoss}</span></div>
       <div class="sbar-item">被斷場次：<span>${totalWin}</span></div>
       <div class="sbar-item">達成里程碑：<span class="highlight">${reached} / ${MILESTONES.length}</span></div>`;

    // Detail table
    let prevTier = null;
    document.getElementById('tbody').innerHTML = rows.map((r) => {
      const cur = r.stage[0];
      let rowCls = tierClass(r.stage);
      if (prevTier && cur !== prevTier) rowCls += ' tier-sep';
      prevTier = cur;
      if (r.ms.length) rowCls += ' ms-row';
      if (r.broke)     rowCls += ' broke';

      const msBadges = r.ms.map((m) => `<span class="badge badge-gold">${m}層 ★</span>`).join('');
      const brokeBadge = r.broke ? '<span class="badge badge-red">被斷</span>' : '';

      const gainedStr = r.broke
        ? '<span style="color:#3d444d">— 贏了</span>'
        : `<span style="color:${tierColour(r.stage)}">+${r.gained}</span>`;

      const streakStr = r.broke
        ? '<span style="color:#3d444d">—</span>'
        : r.streak;

      return `<tr class="${rowCls}">
        <td class="stage-cell">Stage ${r.stage}</td>
        <td class="r">${streakStr}</td>
        <td class="r">${gainedStr}</td>
        <td class="r"><strong>${r.total}</strong></td>
        <td>${brokeBadge}${msBadges}</td>
      </tr>`;
    }).join('');

    document.getElementById('results').style.display = 'block';
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function resetAll() {
    document.getElementById('startStage').value = '2-1';
    document.getElementById('endStage').value   = '4-6';
    document.getElementById('initStacks').value = '0';
    breaks = [];
    renderBreaks();
    document.getElementById('results').style.display = 'none';
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function populateStageSelects() {
    const ss = document.getElementById('startStage');
    const es = document.getElementById('endStage');
    const bi = document.getElementById('breakInput');
    ALL_STAGES.forEach((s) => {
      const makeOption = () => {
        const o = document.createElement('option');
        o.value = s;
        o.textContent = `Stage ${s}`;
        return o;
      };
      ss.appendChild(makeOption());
      es.appendChild(makeOption());
      bi.appendChild(makeOption());
    });
    es.value = '4-6';
  }

  function bindEvents() {
    document.getElementById('addBreakBtn').addEventListener('click', addBreak);
    document.getElementById('clearBreaksBtn').addEventListener('click', clearBreaks);
    document.getElementById('runBtn').addEventListener('click', run);
    document.getElementById('resetBtn').addEventListener('click', resetAll);

    // Delegated handler for the dynamically-rendered remove buttons.
    document.getElementById('breakList').addEventListener('click', (e) => {
      const btn = e.target.closest('.break-remove');
      if (btn) removeBreak(btn.dataset.stage);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') run();
    });
  }

  populateStageSelects();
  bindEvents();
})();
