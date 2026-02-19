/**
 * HTML Report Generator: produces a self-contained HTML dashboard.
 * No external dependencies - all CSS/JS inline.
 */

import type { FullMigrationReport, ModuleSummary, ProgramSummary, MigrationWave } from '../core/types.js';

export const generateHtmlReport = (report: FullMigrationReport): string => {
  const { graph, pipeline, modules, decommission, programs } = report;
  const live = graph.livePrograms || 1;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Migration Dashboard - ${escHtml(report.projectName)}</title>
<style>
${CSS}
</style>
</head>
<body>
<div class="container">

${renderHeader(report)}
${renderKpiCards(report)}
${renderPipelineSection(pipeline, live)}
${renderModulesSection(modules)}
${renderMigrationSequence(report)}
${renderDecommissionSection(decommission, live)}
${renderProgramTable(programs)}
${renderFooter(report)}

</div>
<script>
${JS}
</script>
</body>
</html>`;
};

// ─── Sections ───────────────────────────────────────────────────

const renderHeader = (r: FullMigrationReport): string => `
<header>
  <h1>Migration Dashboard</h1>
  <div class="subtitle">${escHtml(r.projectName)} &mdash; ${r.graph.livePrograms} programmes LIVE</div>
</header>`;

const renderKpiCards = (r: FullMigrationReport): string => {
  const { graph, pipeline, modules, decommission } = r;
  const live = graph.livePrograms || 1;
  const verifiedPct = Math.round(pipeline.verified / live * 100);
  const deliveredPct = modules.total > 0 ? Math.round(modules.deliverable / modules.total * 100) : 0;

  return `
<section class="kpi-grid">
  ${kpiCard('Programmes LIVE', String(graph.livePrograms), `${graph.orphanPrograms} orphelins, ${graph.sharedPrograms} partages`, 'var(--blue)')}
  ${kpiCard('Verified', `${pipeline.verified}/${live}`, `${verifiedPct}% des programmes migres`, 'var(--green)')}
  ${kpiCard('Modules livrables', `${modules.deliverable}/${modules.total}`, `${deliveredPct}% des modules`, 'var(--purple)')}
  ${kpiCard('Decomissionnable', `${decommission.decommissionable}/${decommission.totalLive}`, `${decommission.decommissionPct}% du legacy`, 'var(--orange)')}
</section>`;
};

const kpiCard = (label: string, value: string, detail: string, color: string): string => `
  <div class="kpi-card">
    <div class="kpi-value" style="color: ${color}">${value}</div>
    <div class="kpi-label">${label}</div>
    <div class="kpi-detail">${detail}</div>
  </div>`;

const renderPipelineSection = (pipeline: FullMigrationReport['pipeline'], live: number): string => {
  const total = live;
  const pBar = (count: number, color: string, label: string) => {
    const pct = Math.round(count / total * 100);
    return `
    <div class="pipeline-row">
      <span class="pipeline-label">${label}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${pct}%; background: ${color}"></div>
      </div>
      <span class="pipeline-count">${count} (${pct}%)</span>
    </div>`;
  };

  return `
<section class="card">
  <h2>Pipeline de migration</h2>
  <div class="pipeline">
    ${pBar(pipeline.verified, 'var(--green)', 'Verified')}
    ${pBar(pipeline.enriched, 'var(--blue)', 'Enriched')}
    ${pBar(pipeline.contracted, 'var(--yellow)', 'Contracted')}
    ${pBar(pipeline.pending, 'var(--gray)', 'Pending')}
  </div>
  <div class="pipeline-donut-row">
    ${renderDonut([
      { value: pipeline.verified, color: 'var(--green)', label: 'Verified' },
      { value: pipeline.enriched, color: 'var(--blue)', label: 'Enriched' },
      { value: pipeline.contracted, color: 'var(--yellow)', label: 'Contracted' },
      { value: pipeline.pending, color: 'var(--gray)', label: 'Pending' },
    ], total)}
  </div>
</section>`;
};

const renderDonut = (segments: { value: number; color: string; label: string }[], total: number): string => {
  let offset = 0;
  const strokes: string[] = [];
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  for (const seg of segments) {
    if (seg.value === 0) continue;
    const pct = seg.value / total;
    const dashLength = pct * circumference;
    const dashOffset = -offset * circumference;
    strokes.push(`<circle cx="50" cy="50" r="${radius}" fill="none" stroke="${seg.color}" stroke-width="18" stroke-dasharray="${dashLength} ${circumference - dashLength}" stroke-dashoffset="${dashOffset}" />`);
    offset += pct;
  }

  const legend = segments
    .filter(s => s.value > 0)
    .map(s => `<span class="legend-item"><span class="legend-dot" style="background:${s.color}"></span>${s.label}: ${s.value}</span>`)
    .join('');

  return `
    <div class="donut-container">
      <svg viewBox="0 0 100 100" class="donut">
        ${strokes.join('\n        ')}
      </svg>
      <div class="donut-center">${Math.round((segments[0]?.value ?? 0) / (total || 1) * 100)}%</div>
    </div>
    <div class="legend">${legend}</div>`;
};

const renderModulesSection = (modules: FullMigrationReport['modules']): string => {
  const { list } = modules;
  if (list.length === 0) return '<section class="card"><h2>Modules</h2><p>Aucun module detecte.</p></section>';

  const rows = list.map(m => renderModuleRow(m)).join('');

  return `
<section class="card">
  <h2>Modules (${modules.deliverable} livrables / ${modules.total} total)</h2>
  <div class="module-filters">
    <button class="filter-btn active" data-filter="all">Tous (${modules.total})</button>
    <button class="filter-btn" data-filter="deliverable">Livrables (${modules.deliverable})</button>
    <button class="filter-btn" data-filter="close">Proches &ge;80% (${modules.close})</button>
    <button class="filter-btn" data-filter="progress">En cours (${modules.inProgress})</button>
    <button class="filter-btn" data-filter="notstarted">Non demarre (${modules.notStarted})</button>
  </div>
  <div class="module-sort">
    <span class="sort-label">Trier par:</span>
    <button class="sort-btn active" data-sort="priority">Priorite</button>
    <button class="sort-btn" data-sort="readiness">Readiness</button>
    <button class="sort-btn" data-sort="name">Nom</button>
  </div>
  <div class="module-list">
    ${rows}
  </div>
</section>`;
};

const renderModuleRow = (m: ModuleSummary): string => {
  const statusClass = m.deliverable ? 'deliverable'
    : m.readinessPct >= 80 ? 'close'
    : m.readinessPct > 0 ? 'progress'
    : 'notstarted';

  const statusBadge = m.deliverable ? '<span class="badge badge-green">LIVRABLE</span>'
    : m.readinessPct >= 80 ? '<span class="badge badge-blue">PROCHE</span>'
    : m.readinessPct > 0 ? '<span class="badge badge-yellow">EN COURS</span>'
    : '<span class="badge badge-gray">NON DEMARRE</span>';

  const blockerText = m.blockerIds.length > 0
    ? `<div class="module-blockers">Bloqueurs: ${m.blockerIds.slice(0, 5).join(', ')}${m.blockerIds.length > 5 ? '...' : ''}</div>`
    : '';

  const rankBadge = m.rank != null
    ? `<span class="rank-badge">P${m.rank}</span>`
    : '';

  const depsText = (m.dependsOn?.length ?? 0) > 0
    ? `Depend de: ${m.dependsOn!.join(', ')}`
    : 'Depend de: (aucun)';

  const unblockText = (m.dependedBy?.length ?? 0) > 0
    ? `Debloque: ${m.dependedBy!.length} module${m.dependedBy!.length > 1 ? 's' : ''}`
    : 'Debloque: 0 modules';

  return `
    <div class="module-row" data-status="${statusClass}" data-rank="${m.rank ?? 999}" data-readiness="${m.readinessPct}" data-name="${escHtml(m.rootName)}">
      <div class="module-header">
        <span class="module-name">${rankBadge}${escHtml(String(m.root))} - ${escHtml(m.rootName)}</span>
        ${statusBadge}
      </div>
      <div class="module-stats">
        <span>${m.memberCount} progs</span>
        <div class="bar-track bar-small">
          <div class="bar-fill bar-verified" style="width: ${pct(m.verified, m.memberCount)}%"></div>
          <div class="bar-fill bar-enriched" style="width: ${pct(m.enriched, m.memberCount)}%; left: ${pct(m.verified, m.memberCount)}%"></div>
          <div class="bar-fill bar-contracted" style="width: ${pct(m.contracted, m.memberCount)}%; left: ${pct(m.verified + m.enriched, m.memberCount)}%"></div>
        </div>
        <span class="module-pct">${m.readinessPct}%</span>
      </div>
      <div class="module-breakdown">
        <span class="tag tag-green">${m.verified} verified</span>
        <span class="tag tag-blue">${m.enriched} enriched</span>
        <span class="tag tag-yellow">${m.contracted} contracted</span>
        <span class="tag tag-gray">${m.pending} pending</span>
      </div>
      <div class="module-deps">
        <span>${escHtml(unblockText)}</span>
        <span class="dep-separator">&middot;</span>
        <span>${escHtml(depsText)}</span>
      </div>
      ${blockerText}
    </div>`;
};

const renderMigrationSequence = (r: FullMigrationReport): string => {
  const waves = r.priority?.migrationSequence ?? [];
  if (waves.length === 0) return '';

  // Build a map from module root to name
  const nameMap = new Map(r.modules.list.map(m => [String(m.root), m.rootName]));

  const waveBlocks = waves.map((w, i) => {
    const moduleChips = w.modules.map(root => {
      const name = nameMap.get(String(root)) ?? String(root);
      return `<span class="wave-chip">${escHtml(String(root))} ${escHtml(name)}</span>`;
    }).join('');

    const complexityClass = w.estimatedComplexity === 'HIGH' ? 'complexity-high'
      : w.estimatedComplexity === 'MEDIUM' ? 'complexity-med'
      : 'complexity-low';

    return `
      <div class="wave-block">
        <div class="wave-header">
          <span class="wave-number">Wave ${w.wave}</span>
          <span class="badge ${complexityClass}">${w.estimatedComplexity}</span>
        </div>
        <div class="wave-modules">${moduleChips}</div>
      </div>
      ${i < waves.length - 1 ? '<div class="wave-arrow">&#x2193;</div>' : ''}`;
  }).join('');

  return `
<section class="card">
  <h2>Sequence de migration</h2>
  <div class="wave-sequence">
    ${waveBlocks}
  </div>
</section>`;
};

const renderDecommissionSection = (d: FullMigrationReport['decommission'], live: number): string => `
<section class="card">
  <h2>Decommissionnement Legacy</h2>
  <div class="decommission-grid">
    <div class="decom-stat">
      <div class="decom-value decom-ok">${d.decommissionable}</div>
      <div class="decom-label">Decomissionnables</div>
    </div>
    <div class="decom-stat">
      <div class="decom-value decom-blocked">${d.blockedByStatus}</div>
      <div class="decom-label">Bloques (non migres)</div>
    </div>
    <div class="decom-stat">
      <div class="decom-value decom-wait">${d.blockedByCallers}</div>
      <div class="decom-label">Migres mais callers actifs</div>
    </div>
    <div class="decom-stat">
      <div class="decom-value decom-shared">${d.sharedBlocked}</div>
      <div class="decom-label">Partages bloques</div>
    </div>
  </div>
  <div class="decom-bar-container">
    <div class="bar-track bar-large">
      <div class="bar-fill" style="width: ${d.decommissionPct}%; background: var(--green)"></div>
    </div>
    <div class="decom-bar-label">${d.decommissionPct}% du legacy decomissionnable (${d.decommissionable}/${d.totalLive})</div>
  </div>
</section>`;

const renderProgramTable = (programs: ProgramSummary[]): string => {
  const rows = programs.map(p => {
    const statusClass = `status-${p.status}`;
    const decom = p.decommissionable ? '<span class="badge badge-green badge-sm">OFF</span>' : '';
    const shared = p.shared ? '<span class="badge badge-purple badge-sm">ECF</span>' : '';
    return `<tr class="${statusClass}">
      <td>${escHtml(String(p.id))}</td>
      <td>${escHtml(p.name)}</td>
      <td class="center">${p.level}</td>
      <td><span class="status-pill status-${p.status}">${p.status}</span></td>
      <td class="center">${decom}${shared}</td>
      <td>${escHtml(p.domain)}</td>
    </tr>`;
  }).join('\n');

  return `
<section class="card">
  <h2>Programmes (${programs.length})</h2>
  <div class="table-controls">
    <input type="text" id="prog-search" placeholder="Rechercher par nom ou ID..." class="search-input">
    <select id="status-filter" class="filter-select">
      <option value="">Tous les statuts</option>
      <option value="verified">Verified</option>
      <option value="enriched">Enriched</option>
      <option value="contracted">Contracted</option>
      <option value="pending">Pending</option>
    </select>
    <label class="checkbox-label"><input type="checkbox" id="decom-only"> Decomissionnables</label>
  </div>
  <div class="table-scroll">
    <table id="program-table">
      <thead>
        <tr>
          <th data-sort="id">ID</th>
          <th data-sort="name">Nom</th>
          <th data-sort="level" class="center">Niveau</th>
          <th data-sort="status">Statut</th>
          <th class="center">Tags</th>
          <th data-sort="domain">Domaine</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>
</section>`;
};

const renderFooter = (r: FullMigrationReport): string => `
<footer>
  <p>Genere le ${new Date(r.generated).toLocaleString('fr-FR')} par Migration Factory</p>
</footer>`;

// ─── Helpers ────────────────────────────────────────────────────

const escHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pct = (value: number, total: number): number =>
  total > 0 ? Math.round(value / total * 100) : 0;

// ─── CSS ────────────────────────────────────────────────────────

const CSS = `
:root {
  --bg: #0d1117;
  --card: #161b22;
  --border: #30363d;
  --text: #c9d1d9;
  --text-dim: #8b949e;
  --green: #3fb950;
  --blue: #58a6ff;
  --purple: #bc8cff;
  --yellow: #d29922;
  --orange: #f0883e;
  --red: #f85149;
  --gray: #484f58;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
}

.container { max-width: 1200px; margin: 0 auto; padding: 24px; }

header {
  text-align: center;
  padding: 32px 0 24px;
}
header h1 {
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--blue), var(--purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.subtitle { color: var(--text-dim); margin-top: 4px; }

.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}
.card h2 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text);
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}
.kpi-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}
.kpi-value { font-size: 32px; font-weight: 700; }
.kpi-label { font-size: 14px; color: var(--text-dim); margin-top: 4px; }
.kpi-detail { font-size: 12px; color: var(--text-dim); margin-top: 2px; }

/* Pipeline bars */
.pipeline { display: flex; flex-direction: column; gap: 8px; }
.pipeline-row { display: flex; align-items: center; gap: 12px; }
.pipeline-label { width: 90px; font-size: 13px; color: var(--text-dim); text-align: right; }
.pipeline-count { width: 80px; font-size: 13px; color: var(--text-dim); }
.bar-track {
  flex: 1;
  height: 20px;
  background: var(--bg);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}
.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
  position: absolute;
  top: 0;
}
.bar-small { height: 12px; }
.bar-large { height: 28px; border-radius: 6px; }
.bar-verified { background: var(--green); }
.bar-enriched { background: var(--blue); }
.bar-contracted { background: var(--yellow); }

.pipeline-donut-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  margin-top: 16px;
}
.donut-container { position: relative; width: 120px; height: 120px; }
.donut { width: 100%; height: 100%; transform: rotate(-90deg); }
.donut-center {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 22px;
  font-weight: 700;
  color: var(--green);
}
.legend { display: flex; flex-direction: column; gap: 4px; }
.legend-item { font-size: 13px; display: flex; align-items: center; gap: 6px; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }

/* Modules */
.module-filters {
  display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;
}
.filter-btn {
  padding: 4px 12px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 13px;
}
.filter-btn:hover { border-color: var(--blue); color: var(--blue); }
.filter-btn.active { background: var(--blue); color: #fff; border-color: var(--blue); }

.module-list { display: flex; flex-direction: column; gap: 8px; }
.module-row {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 12px 16px;
  background: var(--bg);
}
.module-row[data-status="deliverable"] { border-left: 3px solid var(--green); }
.module-row[data-status="close"] { border-left: 3px solid var(--blue); }
.module-row[data-status="progress"] { border-left: 3px solid var(--yellow); }
.module-row[data-status="notstarted"] { border-left: 3px solid var(--gray); }

.module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.module-name { font-weight: 600; font-size: 14px; }
.module-stats { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.module-stats span:first-child { width: 70px; font-size: 12px; color: var(--text-dim); }
.module-pct { width: 40px; text-align: right; font-weight: 600; font-size: 13px; }
.module-breakdown { display: flex; gap: 6px; flex-wrap: wrap; }
.module-blockers { font-size: 12px; color: var(--red); margin-top: 4px; }
.module-deps { font-size: 12px; color: var(--text-dim); margin-top: 4px; display: flex; gap: 8px; flex-wrap: wrap; }
.dep-separator { color: var(--border); }

.rank-badge {
  display: inline-block;
  background: var(--purple);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  margin-right: 6px;
}

.module-sort { display: flex; gap: 6px; margin-bottom: 12px; align-items: center; }
.sort-label { font-size: 13px; color: var(--text-dim); }
.sort-btn {
  padding: 2px 10px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 12px;
}
.sort-btn:hover { border-color: var(--purple); color: var(--purple); }
.sort-btn.active { background: var(--purple); color: #fff; border-color: var(--purple); }

/* Migration Waves */
.wave-sequence { display: flex; flex-direction: column; align-items: center; gap: 0; }
.wave-block {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 16px;
  background: var(--bg);
  width: 100%;
  max-width: 600px;
}
.wave-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.wave-number { font-weight: 600; font-size: 14px; color: var(--purple); }
.wave-modules { display: flex; gap: 6px; flex-wrap: wrap; }
.wave-chip {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  background: rgba(188,140,255,0.1);
  color: var(--text);
  border: 1px solid rgba(188,140,255,0.3);
}
.wave-arrow { font-size: 20px; color: var(--purple); text-align: center; line-height: 1; padding: 4px 0; }
.complexity-high { background: rgba(248,81,73,0.2); color: var(--red); }
.complexity-med { background: rgba(210,153,34,0.2); color: var(--yellow); }
.complexity-low { background: rgba(63,185,80,0.2); color: var(--green); }

.tag {
  font-size: 11px; padding: 1px 6px; border-radius: 4px; display: inline-block;
}
.tag-green { background: rgba(63,185,80,0.15); color: var(--green); }
.tag-blue { background: rgba(88,166,255,0.15); color: var(--blue); }
.tag-yellow { background: rgba(210,153,34,0.15); color: var(--yellow); }
.tag-gray { background: rgba(72,79,88,0.3); color: var(--text-dim); }

.badge {
  font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 10px;
  display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;
}
.badge-sm { font-size: 10px; padding: 1px 5px; }
.badge-green { background: rgba(63,185,80,0.2); color: var(--green); }
.badge-blue { background: rgba(88,166,255,0.2); color: var(--blue); }
.badge-yellow { background: rgba(210,153,34,0.2); color: var(--yellow); }
.badge-gray { background: rgba(72,79,88,0.3); color: var(--text-dim); }
.badge-purple { background: rgba(188,140,255,0.2); color: var(--purple); }

/* Decommission */
.decommission-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px; margin-bottom: 16px;
}
.decom-stat { text-align: center; padding: 12px; border-radius: 6px; background: var(--bg); }
.decom-value { font-size: 28px; font-weight: 700; }
.decom-label { font-size: 12px; color: var(--text-dim); margin-top: 2px; }
.decom-ok { color: var(--green); }
.decom-blocked { color: var(--red); }
.decom-wait { color: var(--orange); }
.decom-shared { color: var(--purple); }
.decom-bar-container { text-align: center; }
.decom-bar-label { font-size: 13px; color: var(--text-dim); margin-top: 6px; }

/* Program table */
.table-controls {
  display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; align-items: center;
}
.search-input {
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  font-size: 13px;
  flex: 1;
  min-width: 200px;
}
.filter-select {
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  font-size: 13px;
}
.checkbox-label { font-size: 13px; color: var(--text-dim); display: flex; align-items: center; gap: 4px; }

.table-scroll { overflow-x: auto; }
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
th {
  text-align: left;
  padding: 8px 10px;
  border-bottom: 2px solid var(--border);
  color: var(--text-dim);
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}
th:hover { color: var(--blue); }
td { padding: 6px 10px; border-bottom: 1px solid var(--border); }
.center { text-align: center; }

.status-pill {
  font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 500;
}
.status-verified { background: rgba(63,185,80,0.15); color: var(--green); }
.status-enriched { background: rgba(88,166,255,0.15); color: var(--blue); }
.status-contracted { background: rgba(210,153,34,0.15); color: var(--yellow); }
.status-pending { background: rgba(72,79,88,0.3); color: var(--text-dim); }

tr:hover td { background: rgba(88,166,255,0.05); }

footer {
  text-align: center;
  padding: 20px;
  color: var(--text-dim);
  font-size: 12px;
}

@media (max-width: 768px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .decommission-grid { grid-template-columns: repeat(2, 1fr); }
}
`;

// ─── JS ─────────────────────────────────────────────────────────

const JS = `
// Module filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.module-row').forEach(row => {
      if (filter === 'all') { row.style.display = ''; return; }
      row.style.display = row.dataset.status === filter ? '' : 'none';
    });
  });
});

// Module sort buttons
document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const sortBy = btn.dataset.sort;
    const list = document.querySelector('.module-list');
    if (!list) return;
    const rows = Array.from(list.querySelectorAll('.module-row'));
    rows.sort((a, b) => {
      if (sortBy === 'priority') return (Number(a.dataset.rank) || 999) - (Number(b.dataset.rank) || 999);
      if (sortBy === 'readiness') return (Number(b.dataset.readiness) || 0) - (Number(a.dataset.readiness) || 0);
      return (a.dataset.name || '').localeCompare(b.dataset.name || '');
    });
    rows.forEach(r => list.appendChild(r));
  });
});

// Program search
const searchInput = document.getElementById('prog-search');
const statusFilter = document.getElementById('status-filter');
const decomOnly = document.getElementById('decom-only');
const table = document.getElementById('program-table');

const filterTable = () => {
  const query = searchInput.value.toLowerCase();
  const status = statusFilter.value;
  const decom = decomOnly.checked;
  const rows = table.querySelectorAll('tbody tr');

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const id = cells[0].textContent.toLowerCase();
    const name = cells[1].textContent.toLowerCase();
    const rowStatus = cells[3].textContent.trim().toLowerCase();
    const hasDecom = cells[4].textContent.includes('OFF');

    const matchesSearch = !query || id.includes(query) || name.includes(query);
    const matchesStatus = !status || rowStatus === status;
    const matchesDecom = !decom || hasDecom;

    row.style.display = matchesSearch && matchesStatus && matchesDecom ? '' : 'none';
  });
};

searchInput.addEventListener('input', filterTable);
statusFilter.addEventListener('change', filterTable);
decomOnly.addEventListener('change', filterTable);

// Table sort
let sortCol = null;
let sortDir = 1;
document.querySelectorAll('th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const col = th.dataset.sort;
    if (sortCol === col) sortDir *= -1;
    else { sortCol = col; sortDir = 1; }

    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const colIndex = { id: 0, name: 1, level: 2, status: 3, domain: 5 }[col] ?? 0;

    rows.sort((a, b) => {
      const va = a.querySelectorAll('td')[colIndex].textContent.trim();
      const vb = b.querySelectorAll('td')[colIndex].textContent.trim();
      const na = Number(va), nb = Number(vb);
      if (!isNaN(na) && !isNaN(nb)) return (na - nb) * sortDir;
      return va.localeCompare(vb) * sortDir;
    });

    rows.forEach(r => tbody.appendChild(r));
  });
});
`;
