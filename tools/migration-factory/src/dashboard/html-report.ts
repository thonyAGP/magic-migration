/**
 * HTML Report Generator: produces a self-contained HTML dashboard.
 * No external dependencies - all CSS/JS inline.
 */

import type {
  FullMigrationReport, ModuleSummary, ProgramSummary, MigrationWave,
  MultiProjectReport, ProjectEntry, GlobalSummary, ProgramEstimation,
} from '../core/types.js';

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
${renderEstimationSection(report)}
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

const renderHeader = (r: FullMigrationReport): string => {
  const dt = new Date(r.generated);
  const dateStr = dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `
<header>
  <h1>Migration Dashboard</h1>
  <div class="subtitle">${escHtml(r.projectName)} &mdash; ${r.graph.livePrograms} programmes LIVE</div>
  <div class="last-updated">Derniere mise a jour : ${dateStr} a ${timeStr}</div>
</header>`;
};

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

const gradeBadge = (grade: string): string => {
  const colorMap: Record<string, string> = { S: 'var(--red)', A: 'var(--orange)', B: 'var(--yellow)', C: 'var(--blue)', D: 'var(--green)' };
  const color = colorMap[grade] ?? 'var(--gray)';
  return `<span class="grade-badge" style="background:${color}">${grade}</span>`;
};

const renderEstimationSection = (r: FullMigrationReport): string => {
  const est = r.estimation;
  if (!est) return '';

  const { totalEstimatedHours, remainingHours, avgScore, gradeDistribution, top10 } = est;
  const completedHours = totalEstimatedHours - remainingHours;
  const progressPct = totalEstimatedHours > 0 ? Math.round(completedHours / totalEstimatedHours * 100) : 0;

  // Donut for grade distribution
  const gradeColors: Record<string, string> = { S: 'var(--red)', A: 'var(--orange)', B: 'var(--yellow)', C: 'var(--blue)', D: 'var(--green)' };
  const gradeSegments = Object.entries(gradeDistribution)
    .filter(([, v]) => v > 0)
    .map(([grade, value]) => ({ value, color: gradeColors[grade] ?? 'var(--gray)', label: `Grade ${grade}` }));
  const gradeTotal = gradeSegments.reduce((s, seg) => s + seg.value, 0);

  const top10Rows = top10.map(p =>
    `<tr>
      <td>${escHtml(String(p.id))}</td>
      <td>${escHtml(p.name)}</td>
      <td class="center">${gradeBadge(p.score.grade)}</td>
      <td class="center">${p.score.normalizedScore}</td>
      <td class="center">${p.score.estimatedHours}h</td>
      <td><span class="status-pill status-${p.status}">${p.status}</span></td>
    </tr>`).join('');

  return `
<section class="card">
  <h2>Estimation &amp; Effort</h2>
  <div class="estimation-grid">
    <div class="estimation-kpi">
      ${kpiCard('Effort total', `${totalEstimatedHours}h`, `Score moyen: ${avgScore}`, 'var(--purple)')}
      ${kpiCard('Effort restant', `${remainingHours}h`, `${progressPct}% complete`, 'var(--orange)')}
    </div>
    <div class="estimation-donut">
      ${gradeTotal > 0 ? renderDonut(gradeSegments, gradeTotal) : '<div class="no-data">Pas de donnees</div>'}
    </div>
  </div>
  <div class="effort-bar-container">
    <div class="bar-track bar-large">
      <div class="bar-fill" style="width: ${progressPct}%; background: linear-gradient(90deg, var(--green), var(--blue))"></div>
    </div>
    <div class="effort-bar-label">${completedHours}h completes / ${totalEstimatedHours}h total (${progressPct}%)</div>
  </div>
  ${top10.length > 0 ? `
  <h3 style="margin-top:16px;margin-bottom:8px;font-size:14px;color:var(--text-dim)">Top 10 programmes les plus complexes</h3>
  <div class="table-scroll">
    <table>
      <thead><tr>
        <th>ID</th><th>Nom</th><th class="center">Grade</th><th class="center">Score</th><th class="center">Est.</th><th>Statut</th>
      </tr></thead>
      <tbody>${top10Rows}</tbody>
    </table>
  </div>` : ''}
</section>`;
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

  const batchLabel = m.batchId
    ? `<span class="tag tag-purple">${escHtml(m.batchId)}</span>`
    : '';

  const domainLabel = m.domain
    ? `<span class="tag tag-teal">${escHtml(m.domain)}</span>`
    : '';

  const gradeLabel = m.complexityGrade
    ? `<span class="tag tag-orange">${escHtml(m.complexityGrade)} grade</span>`
    : '';

  const hoursLabel = m.estimatedHours != null
    ? `<span class="tag tag-dim">~${m.estimatedHours}h</span>`
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
        <span class="module-name">${rankBadge}${batchLabel}${escHtml(m.rootName)}</span>
        ${domainLabel}${gradeLabel}${hoursLabel}
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
    const gradeCell = p.complexityGrade ? gradeBadge(p.complexityGrade) : '-';
    const scoreCell = p.complexityScore != null ? String(p.complexityScore) : '-';
    const estCell = p.estimatedHours != null ? `${p.estimatedHours}h` : '-';
    return `<tr class="${statusClass}">
      <td>${escHtml(String(p.id))}</td>
      <td>${escHtml(p.name)}</td>
      <td class="center">${p.level}</td>
      <td><span class="status-pill status-${p.status}">${p.status}</span></td>
      <td class="center">${gradeCell}</td>
      <td class="center">${scoreCell}</td>
      <td class="center">${estCell}</td>
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
          <th data-sort="grade" class="center">Grade</th>
          <th data-sort="score" class="center">Score</th>
          <th data-sort="est" class="center">Est.</th>
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

// ═══════════════════════════════════════════════════════════════════
// Multi-Project Report
// ═══════════════════════════════════════════════════════════════════

export const generateMultiProjectHtmlReport = (report: MultiProjectReport): string => {
  const dt = new Date(report.generated);
  const dateStr = dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Only active projects get tabs (those with actual migration data)
  const activeProjects = report.projects.filter(p => p.status === 'active');

  const projectTabs = activeProjects
    .map(p => `<button class="project-tab" data-project="${escHtml(p.name)}"><span class="tab-dot tab-dot-active"></span>${escHtml(p.name)}</button>`)
    .join('\n    ');

  const projectContents = activeProjects
    .map(p => renderProjectTab(p))
    .join('\n');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SPECMAP - Migration Dashboard</title>
<style>
${CSS}
${MULTI_CSS}
</style>
</head>
<body>
<div class="container">

<header>
  <h1>SPECMAP Migration Dashboard</h1>
  <div class="subtitle">${report.global.totalProjects} projets &middot; ${report.global.activeProjects} actif${report.global.activeProjects > 1 ? 's' : ''} &middot; ${report.global.totalLivePrograms} programmes LIVE</div>
  <div class="last-updated">Derniere mise a jour : ${dateStr} a ${timeStr}</div>
</header>

<nav class="project-tabs-bar">
  <button class="project-tab active" data-project="global"><span class="tab-dot tab-dot-global"></span>Vue Globale</button>
  ${projectTabs}
</nav>

<div class="action-bar" id="action-bar">
  <span class="server-badge disconnected" id="server-badge">Offline</span>
  <select id="batch-select" class="action-select" disabled>
    <option value="">Select batch...</option>
  </select>
  <button class="action-btn" id="btn-preflight" disabled title="Run 'migration-factory serve' to enable">Preflight</button>
  <button class="action-btn primary" id="btn-run" disabled title="Run 'migration-factory serve' to enable">Run Pipeline</button>
  <button class="action-btn" id="btn-verify" disabled title="Run 'migration-factory serve' to enable">Verify</button>
  <button class="action-btn" id="btn-gaps" disabled title="Run 'migration-factory serve' to enable">Gaps</button>
  <button class="action-btn" id="btn-calibrate" disabled title="Run 'migration-factory serve' to enable">Calibrate</button>
  <button class="action-btn" id="btn-generate" disabled title="Run 'migration-factory serve' to enable" style="background:#7c3aed;color:#fff">Generate Code</button>
  <button class="action-btn" id="btn-migrate" disabled title="Run 'migration-factory serve' to enable" style="background:#059669;color:#fff">Migrate Module</button>
  <button class="action-btn" id="btn-migrate-auto" disabled title="Run 'migration-factory serve' to enable" style="background:#0d9488;color:#fff">Migration Auto</button>
  <button class="action-btn" id="btn-analyze" disabled title="Run 'migration-factory serve' to enable" style="background:#6366f1;color:#fff">Analyze Project</button>
  <select id="sel-enrich" disabled title="Enrichment mode" style="padding:4px 8px;border-radius:4px;border:1px solid var(--border);background:var(--card-bg);color:var(--text-main);font-size:12px">
    <option value="none">No enrich</option>
    <option value="heuristic" selected>Heuristic</option>
    <option value="claude">Claude API</option>
    <option value="claude-cli">Claude CLI</option>
  </select>
  <label style="margin-left:auto;font-size:12px;color:var(--text-dim);display:flex;align-items:center;gap:4px"><input type="checkbox" id="chk-dry" disabled> Dry Run</label>
  <button class="action-btn" id="btn-help" style="padding:4px 10px;font-weight:700;font-size:14px;border-radius:50%;min-width:28px" title="Help &amp; Documentation">?</button>
</div>
<div class="action-panel" id="action-panel">
  <div class="action-panel-header">
    <strong id="panel-title">Results</strong>
    <button class="action-btn" id="btn-close" style="padding:2px 8px;font-size:11px">Close</button>
  </div>
  <pre id="panel-content"></pre>
</div>

<!-- Migration progress panel (bottom-anchored, collapsible) -->
<div class="migrate-panel" id="migrate-overlay">
  <div class="migrate-panel-header" id="migrate-panel-toggle">
    <strong id="migrate-overlay-title">Migration</strong>
    <div style="display:flex;align-items:center;gap:6px">
      <span id="migrate-panel-badge" class="migrate-badge" style="display:none"></span>
      <button class="action-btn" id="migrate-overlay-minimize" style="padding:2px 8px;font-size:11px" title="Minimize/Expand">_</button>
      <button class="action-btn" id="migrate-overlay-close" style="padding:2px 8px;font-size:11px" title="Close">X</button>
    </div>
  </div>
  <div class="migrate-panel-body" id="migrate-panel-body">
    <!-- Section 1: Module progress bar -->
    <div class="mp-section">
      <div class="mp-bar-row">
        <div class="mp-bar-track"><div class="mp-bar-fill mp-bar-module" id="mp-module-bar"></div></div>
        <span class="mp-bar-label" id="mp-module-label">0/0 (0%)</span>
      </div>
      <div class="mp-elapsed" id="mp-elapsed"></div>
    </div>
    <!-- Section 2: Current program progress bar -->
    <div class="mp-section" id="mp-prog-section" style="display:none">
      <div class="mp-prog-title" id="mp-prog-title"></div>
      <div class="mp-bar-row">
        <div class="mp-bar-track"><div class="mp-bar-fill mp-bar-prog" id="mp-prog-bar"></div></div>
        <span class="mp-bar-label" id="mp-prog-label"></span>
      </div>
    </div>
    <!-- Section 3: Program grid -->
    <div class="mp-grid-section" id="mp-grid-section" style="display:none">
      <table class="mp-grid">
        <thead><tr><th>IDE</th><th>Programme</th><th></th><th>Phases</th></tr></thead>
        <tbody id="mp-grid-body"></tbody>
      </table>
    </div>
    <!-- Section 4: Log (collapsible) -->
    <div class="mp-log-section">
      <div class="mp-log-toggle" id="mp-log-toggle"><span class="mp-log-arrow">&#9660;</span> Log</div>
      <div class="mp-log" id="mp-log"></div>
    </div>
  </div>
</div>

<!-- Confirmation modal before migration launch -->
<div class="modal-backdrop" id="migrate-confirm-modal">
  <div class="modal-content">
    <h3 style="margin:0 0 16px 0;font-size:18px">Launch Migration</h3>
    <div class="modal-field">
      <label>Batch</label>
      <div id="modal-batch-info" style="font-weight:600"></div>
    </div>
    <div class="modal-field">
      <label for="modal-target-dir">Target directory</label>
      <input type="text" id="modal-target-dir" class="modal-input" value="adh-web" placeholder="e.g., adh-web">
      <div id="modal-target-resolved" style="font-size:11px;color:#8b949e;margin-top:2px"></div>
    </div>
    <div class="modal-field">
      <label for="modal-parallel">Parallel programs</label>
      <input type="number" id="modal-parallel" class="modal-input" value="1" min="1" max="8" style="width:80px">
    </div>
    <div class="modal-field">
      <label>Claude mode</label>
      <div id="modal-claude-mode" style="font-size:13px;color:#8b949e"></div>
    </div>
    <div class="modal-field">
      <label>Dry Run</label>
      <div id="modal-dry-run" style="font-size:13px;color:#8b949e"></div>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px">
      <button class="action-btn" id="modal-cancel">Cancel</button>
      <button class="action-btn primary" id="modal-launch" style="background:#059669;border-color:#059669">Launch Migration</button>
    </div>
  </div>
</div>

<!-- Help overlay -->
<div class="help-overlay" id="help-overlay">
  <div class="help-content">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h2 style="margin:0;font-size:20px">Migration Factory - Guide</h2>
      <button class="action-btn" id="help-close" style="padding:4px 12px">Close</button>
    </div>

    <div class="help-section">
      <h3>What is this?</h3>
      <p>The Migration Factory Dashboard is an interactive tool for managing the migration of legacy Magic Unipaas programs to modern React/TypeScript web applications.</p>
      <p>It orchestrates the full SPECMAP pipeline: <strong>EXTRACT &rarr; MAP &rarr; GAP &rarr; CONTRACT &rarr; ENRICH &rarr; VERIFY</strong></p>
    </div>

    <div class="help-section">
      <h3>Action Bar Buttons</h3>
      <table class="help-table">
        <tr><td><strong>Preflight</strong></td><td>Check prerequisites before running a batch (contracts, dependencies, gaps)</td></tr>
        <tr><td><strong>Run Pipeline</strong></td><td>Execute the SPECMAP pipeline on a batch (contract &rarr; verify)</td></tr>
        <tr><td><strong>Verify</strong></td><td>Auto-verify all contracts where all items are IMPL or N/A</td></tr>
        <tr><td><strong>Gaps</strong></td><td>Show consolidated gap report by contract</td></tr>
        <tr><td><strong>Calibrate</strong></td><td>Recalculate hours-per-point estimate from verified contracts</td></tr>
        <tr><td><strong>Generate Code</strong></td><td>Generate React/TS scaffold files from contracts</td></tr>
        <tr><td><strong>Migrate Module</strong></td><td>Full 15-phase migration pipeline (spec &rarr; code &rarr; test &rarr; review)</td></tr>
        <tr><td><strong>Migration Auto</strong></td><td>Same as Migrate Module but skips confirmation modal (target: adh-web, parallel: 1)</td></tr>
      </table>
    </div>

    <div class="help-section">
      <h3>Enrichment Modes</h3>
      <table class="help-table">
        <tr><td><strong>No enrich</strong></td><td>Generate skeleton code only (types, empty components)</td></tr>
        <tr><td><strong>Heuristic</strong></td><td>Auto-fill types and defaults based on contract data</td></tr>
        <tr><td><strong>Claude API</strong></td><td>Use Anthropic API with ANTHROPIC_API_KEY for AI-assisted enrichment</td></tr>
        <tr><td><strong>Claude CLI</strong></td><td>Use local <code>claude --print</code> command for AI-assisted enrichment</td></tr>
      </table>
    </div>

    <div class="help-section">
      <h3>Migration Phases (15)</h3>
      <p>Each program goes through these phases during <strong>Migrate Module</strong>:</p>
      <ol class="help-phases">
        <li><strong>SPEC</strong> - Extract program specification</li>
        <li><strong>CONTRACT</strong> - Generate migration contract</li>
        <li><strong>ENRICH</strong> - AI-enrich contract details</li>
        <li><strong>SCAFFOLD</strong> - Generate React/TS files</li>
        <li><strong>IMPLEMENT</strong> - Implement business logic</li>
        <li><strong>TYPES</strong> - Generate TypeScript types</li>
        <li><strong>STORE</strong> - Generate Zustand store</li>
        <li><strong>API</strong> - Generate API endpoints</li>
        <li><strong>COMPONENT</strong> - Generate React component</li>
        <li><strong>TEST</strong> - Generate test files</li>
        <li><strong>INTEGRATE</strong> - Wire into app routing</li>
        <li><strong>LINT</strong> - Fix lint/type errors</li>
        <li><strong>BUILD</strong> - Verify build passes</li>
        <li><strong>TEST_RUN</strong> - Run tests</li>
        <li><strong>REVIEW</strong> - Final code review</li>
      </ol>
    </div>

    <div class="help-section">
      <h3>Batches</h3>
      <table class="help-table">
        <tr><td><strong>B1</strong></td><td>Ouverture session (18 progs) - 100% VERIFIED</td></tr>
        <tr><td><strong>B2</strong></td><td>Fermeture session (IDE 131)</td></tr>
        <tr><td><strong>B3</strong></td><td>Ventes GP/Boutique (~24 progs)</td></tr>
        <tr><td><strong>B4</strong></td><td>Extrait compte (~9 progs)</td></tr>
        <tr><td><strong>B5</strong></td><td>Separation/Fusion (~8 progs)</td></tr>
      </table>
    </div>

    <div class="help-section">
      <h3>CLI Commands</h3>
      <pre class="help-cli">migration-factory serve --port 3070 --dir ADH    # Start dashboard
migration-factory report --multi                   # Generate static HTML
migration-factory pipeline run --batch B1          # Run pipeline
migration-factory migrate --batch B1 --target adh-web  # Full migration
migration-factory migrate status                   # Check progress
migration-factory verify                           # Auto-verify contracts
migration-factory gaps                             # Gap report
migration-factory calibrate                        # Recalculate estimates</pre>
    </div>

    <div class="help-section">
      <h3>Tips</h3>
      <ul>
        <li>Use <strong>Dry Run</strong> checkbox to preview actions without modifying files</li>
        <li>You can <strong>refresh the page</strong> during a migration - it will reconnect and show progress</li>
        <li>The elapsed timer shows how long the current migration has been running</li>
        <li>Events are polled every 3 seconds after reconnection</li>
      </ul>
    </div>

    <div class="help-section" style="opacity:0.7">
      <h3>Planned Improvements</h3>
      <ul>
        <li>Timer per event to detect blockages (green/orange/red)</li>
        <li>Estimated time remaining based on average speed</li>
        <li>Target directory browser with history</li>
      </ul>
    </div>
  </div>
</div>

<div class="tab-content active" data-tab="global">
  ${renderGlobalView(report)}
</div>

${projectContents}

<footer>
  <p>Genere le ${dateStr} a ${timeStr} par Migration Factory</p>
</footer>

</div>
<script>
${JS}
${MULTI_JS}
</script>
</body>
</html>`;
};

const renderGlobalView = (report: MultiProjectReport): string => {
  const g = report.global;
  const total = g.totalLivePrograms || 1;

  // Sort: active first, then alphabetically within each group
  const sortedProjects = [...report.projects].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return a.name.localeCompare(b.name);
  });

  const projectCards = sortedProjects.map(p => {
    const r = p.report;
    if (!r) {
      return `
      <div class="project-card project-card-idle">
        <div class="project-card-name">${escHtml(p.name)}</div>
        <div class="project-card-desc">${escHtml(p.description)}</div>
        <div class="project-card-status"><span class="badge badge-gray">NON DEMARRE</span></div>
        <div class="project-card-stat">${p.programCount > 0 ? p.programCount + ' programmes' : ''}</div>
      </div>`;
    }
    const live = r.graph.livePrograms;
    const vPct = live > 0 ? Math.round(r.pipeline.verified / live * 100) : 0;
    const statusBadge = vPct >= 100 ? '<span class="badge badge-green">COMPLETE</span>'
      : vPct > 0 ? '<span class="badge badge-blue">EN COURS</span>'
      : r.pipeline.contracted > 0 ? '<span class="badge badge-yellow">CONTRACTED</span>'
      : '<span class="badge badge-gray">PENDING</span>';

    return `
      <div class="project-card project-card-active" data-goto="${escHtml(p.name)}">
        <div class="project-card-name">${escHtml(p.name)}</div>
        <div class="project-card-desc">${escHtml(p.description)}</div>
        <div class="project-card-status">${statusBadge}</div>
        <div class="project-card-progress">
          <div class="bar-track bar-small">
            <div class="bar-fill" style="width:${vPct}%; background:var(--green)"></div>
          </div>
          <span class="project-card-pct">${vPct}%</span>
        </div>
        <div class="project-card-stats">
          <span>${live} LIVE</span>
          <span>${r.pipeline.verified} verified</span>
          <span>${r.pipeline.contracted} contracted</span>
          <span>${r.modules.total} modules</span>
        </div>
      </div>`;
  }).join('');

  const pBar = (count: number, color: string, label: string) => {
    const pctVal = Math.round(count / total * 100);
    return `
    <div class="pipeline-row">
      <span class="pipeline-label">${label}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${pctVal}%; background: ${color}"></div>
      </div>
      <span class="pipeline-count">${count} (${pctVal}%)</span>
    </div>`;
  };

  return `
<section class="kpi-grid">
  ${kpiCard('Projets actifs', `${g.activeProjects}/${g.totalProjects}`, `${g.totalProjects - g.activeProjects} en attente`, 'var(--purple)')}
  ${kpiCard('Programmes LIVE', String(g.totalLivePrograms), 'Tous projets confondus', 'var(--blue)')}
  ${kpiCard('Verified', `${g.totalVerified}/${g.totalLivePrograms}`, `${g.overallProgressPct}% progression globale`, 'var(--green)')}
  ${kpiCard('Contracted', String(g.totalContracted), `${g.totalEnriched} enriched`, 'var(--yellow)')}
</section>

<section class="card">
  <h2>Pipeline globale</h2>
  <div class="pipeline">
    ${pBar(g.totalVerified, 'var(--green)', 'Verified')}
    ${pBar(g.totalEnriched, 'var(--blue)', 'Enriched')}
    ${pBar(g.totalContracted, 'var(--yellow)', 'Contracted')}
    ${pBar(g.totalPending, 'var(--gray)', 'Pending')}
  </div>
</section>

<section class="card">
  <h2>Projets</h2>
  <div class="project-cards-grid">
    ${projectCards}
  </div>
</section>`;
};

const renderProjectTab = (entry: ProjectEntry): string => {
  const r = entry.report!;
  const live = r.graph.livePrograms || 1;

  return `
<div class="tab-content" data-tab="${escHtml(entry.name)}">
  ${renderKpiCards(r)}
  ${renderPipelineSection(r.pipeline, live)}
  ${renderEstimationSection(r)}
  ${renderModulesSection(r.modules)}
  ${renderMigrationSequence(r)}
  ${renderDecommissionSection(r.decommission, live)}
  ${renderProgramTable(r.programs)}
</div>`;
};

// Empty project tabs removed: only active projects get tabs

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
.last-updated {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-dim);
  background: rgba(88,166,255,0.08);
  display: inline-block;
  padding: 4px 16px;
  border-radius: 16px;
  border: 1px solid rgba(88,166,255,0.2);
}

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
.tag-purple { background: rgba(139,92,246,0.2); color: #a78bfa; font-weight: 600; }
.tag-teal { background: rgba(20,184,166,0.15); color: #5eead4; }
.tag-orange { background: rgba(249,115,22,0.15); color: #fb923c; }
.tag-dim { background: rgba(72,79,88,0.15); color: var(--text-dim); }

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

/* Grade badge */
.grade-badge {
  display: inline-block;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  min-width: 24px;
  text-align: center;
}

/* Estimation section */
.estimation-grid {
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.estimation-kpi {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}
.estimation-kpi .kpi-card { flex: 1; min-width: 180px; }
.estimation-donut { flex: 0 0 auto; }
.effort-bar-container { text-align: center; margin-top: 8px; }
.effort-bar-label { font-size: 13px; color: var(--text-dim); margin-top: 6px; }
.no-data { color: var(--text-dim); font-style: italic; padding: 20px; }

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
  if (!searchInput || !statusFilter || !decomOnly) return;
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

if (searchInput) searchInput.addEventListener('input', filterTable);
if (statusFilter) statusFilter.addEventListener('change', filterTable);
if (decomOnly) decomOnly.addEventListener('change', filterTable);

// Table sort
let sortCol = null;
let sortDir = 1;
document.querySelectorAll('th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    if (!table) return;
    const col = th.dataset.sort;
    if (sortCol === col) sortDir *= -1;
    else { sortCol = col; sortDir = 1; }

    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const colIndex = { id: 0, name: 1, level: 2, status: 3, grade: 4, score: 5, est: 6, domain: 8 }[col] ?? 0;

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

// ─── Multi-Project CSS ──────────────────────────────────────────

const MULTI_CSS = `
/* Project Tab Bar */
.project-tabs-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  padding: 4px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow-x: auto;
  flex-wrap: wrap;
}
.project-tab {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  transition: all 0.2s;
}
.project-tab:hover { color: var(--text); background: rgba(88,166,255,0.08); }
.project-tab.active { background: var(--blue); color: #fff; }
.tab-dot {
  width: 8px; height: 8px; border-radius: 50%; display: inline-block;
}
.tab-dot-global { background: var(--purple); }
.tab-dot-active { background: var(--green); }
.tab-dot-planned { background: var(--yellow); }
.tab-dot-idle { background: var(--gray); }

/* Tab Content */
.tab-content { display: none; }
.tab-content.active { display: block; }

/* Project Cards Grid */
.project-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
.project-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  background: var(--bg);
  cursor: pointer;
  transition: border-color 0.2s, transform 0.15s;
}
.project-card:hover { border-color: var(--blue); transform: translateY(-2px); }
.project-card-idle { opacity: 0.6; cursor: default; }
.project-card-idle:hover { border-color: var(--border); transform: none; }
.project-card-name { font-size: 18px; font-weight: 700; margin-bottom: 2px; }
.project-card-desc { font-size: 12px; color: var(--text-dim); margin-bottom: 6px; }
.project-card-status { margin-bottom: 8px; }
.project-card-progress { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.project-card-pct { font-weight: 600; font-size: 14px; width: 40px; text-align: right; }
.project-card-stats {
  display: flex; gap: 8px; flex-wrap: wrap; font-size: 11px; color: var(--text-dim);
}
.project-card-stats span {
  padding: 1px 6px;
  background: rgba(72,79,88,0.2);
  border-radius: 4px;
}
.project-card-stat { font-size: 13px; color: var(--text-dim); }

/* Empty project tab */
.empty-project { text-align: center; padding: 60px 20px; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-message p { margin-bottom: 8px; }
.empty-detail { color: var(--text-dim); font-size: 14px; }
.empty-hint { color: var(--text-dim); font-size: 12px; margin-top: 16px; }
.empty-hint code {
  background: var(--bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

/* Action Bar */
.action-bar {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  flex-wrap: wrap;
}
.server-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.server-badge.connected { background: rgba(63,185,80,0.2); color: var(--green); }
.server-badge.disconnected { background: rgba(72,79,88,0.3); color: var(--text-dim); }
.action-select {
  padding: 5px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  font-size: 13px;
  min-width: 140px;
}
.action-select:disabled { opacity: 0.5; cursor: not-allowed; }
.action-btn {
  padding: 5px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.15s;
}
.action-btn:hover:not(:disabled) { border-color: var(--blue); color: var(--blue); }
.action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.action-btn.primary { background: var(--blue); color: #fff; border-color: var(--blue); }
.action-btn.primary:hover:not(:disabled) { background: #4b9cf5; }
.action-btn.primary:disabled { background: var(--gray); border-color: var(--gray); }
.action-panel {
  display: none;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  max-height: 400px;
  overflow-y: auto;
}
.action-panel.visible { display: block; }
.pipeline-progress { padding: 8px 0; }
.progress-bar { height: 20px; background: #1e293b; border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #10b981); width: 0%; transition: width 0.3s; }
.p-status { margin-top: 6px; font-size: 13px; color: #94a3b8; }
.p-log { max-height: 300px; overflow-y: auto; font-size: 12px; margin-top: 8px; }
.p-log > div { padding: 2px 0; border-bottom: 1px solid #1e293b; color: #cbd5e1; }
.action-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.action-panel pre {
  margin: 0;
  white-space: pre-wrap;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text);
}
.action-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid var(--border);
  border-top-color: var(--blue);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-right: 6px;
  vertical-align: middle;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Migration Panel (bottom-anchored, collapsible) */
.migrate-panel {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: var(--card);
  border-top: 2px solid var(--blue);
  z-index: 1000;
  flex-direction: column;
  max-height: 50vh;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
  transition: max-height 0.3s ease;
}
.migrate-panel.visible { display: flex; }
.migrate-panel.collapsed { max-height: 42px; }
.migrate-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  color: #e2e8f0;
  flex-shrink: 0;
  cursor: pointer;
  background: rgba(0,0,0,0.2);
  user-select: none;
}
.migrate-panel-header strong { font-size: 14px; }
.migrate-badge {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 10px;
  background: var(--green);
  color: #000;
  font-weight: 600;
}
.migrate-panel-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 0;
  overflow: hidden;
}
.migrate-panel.collapsed .migrate-panel-body { display: none; }
.mp-section { padding: 6px 16px 2px; flex-shrink: 0; }
.mp-bar-row { display: flex; align-items: center; gap: 8px; }
.mp-bar-track { flex: 1; height: 14px; background: #1e293b; border-radius: 7px; overflow: hidden; }
.mp-bar-fill { height: 100%; border-radius: 7px; transition: width 0.4s ease; }
.mp-bar-module { background: linear-gradient(90deg, #3b82f6, #3fb950); }
.mp-bar-prog { background: #f59e0b; }
.mp-bar-label { font-size: 12px; color: #e2e8f0; white-space: nowrap; min-width: 90px; }
.mp-elapsed { font-size: 11px; color: #8b949e; margin-top: 2px; }
.mp-prog-title { font-size: 12px; color: #e2e8f0; margin-bottom: 3px; font-weight: 600; }
.mp-grid-section { padding: 4px 16px; max-height: 200px; overflow-y: auto; flex-shrink: 0; }
.mp-grid { width: 100%; border-collapse: collapse; font-size: 12px; }
.mp-grid th { text-align: left; color: #8b949e; font-weight: 500; padding: 2px 6px; border-bottom: 1px solid #334155; font-size: 11px; }
.mp-grid td { padding: 3px 6px; color: #cbd5e1; border-bottom: 1px solid #1e293b; }
.mp-grid td:first-child { color: #8b949e; font-variant-numeric: tabular-nums; }
.mp-grid td:nth-child(2) { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mp-grid td:nth-child(3) { text-align: center; width: 24px; }
.mp-row-active { background: rgba(59,130,246,0.1); }
.mp-row-done td { opacity: 0.6; }
.mp-dots { display: flex; gap: 2px; }
.mp-dot { width: 8px; height: 8px; border-radius: 50%; background: #334155; flex-shrink: 0; }
.mp-dot.done { background: #3fb950; }
.mp-dot.active { background: #f59e0b; animation: mp-pulse 1s ease-in-out infinite; }
.mp-dot.failed { background: #f85149; }
@keyframes mp-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
.mp-log-section { padding: 0 16px 8px; flex: 1; display: flex; flex-direction: column; min-height: 0; }
.mp-log-toggle { font-size: 12px; color: #8b949e; cursor: pointer; padding: 4px 0; user-select: none; }
.mp-log-toggle:hover { color: #e2e8f0; }
.mp-log-arrow { display: inline-block; transition: transform 0.2s; }
.mp-log-section.collapsed .mp-log-arrow { transform: rotate(-90deg); }
.mp-log { flex: 1; overflow-y: auto; font-size: 11px; min-height: 0; max-height: calc(50vh - 280px); }
.mp-log-section.collapsed .mp-log { display: none; }
.mp-log > div { padding: 1px 0; border-bottom: 1px solid #1e293b; color: #94a3b8; }

/* Confirmation Modal */
.modal-backdrop {
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  z-index: 1100;
  justify-content: center;
  align-items: center;
}
.modal-backdrop.visible { display: flex; }
.modal-content {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  min-width: 400px;
  max-width: 500px;
  color: var(--text);
}
.modal-field {
  margin-bottom: 12px;
}
.modal-field label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-dim);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.modal-input {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}
.modal-input:focus { border-color: var(--blue); outline: none; }

/* Help Overlay */
.help-overlay {
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85);
  z-index: 1200;
  justify-content: center;
  overflow-y: auto;
  padding: 40px 20px;
}
.help-overlay.visible { display: flex; }
.help-content {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 32px;
  max-width: 700px;
  width: 100%;
  color: var(--text);
  align-self: flex-start;
}
.help-section { margin-bottom: 20px; }
.help-section h3 { font-size: 15px; margin: 0 0 8px 0; color: var(--blue); }
.help-section p { font-size: 13px; line-height: 1.6; margin: 0 0 6px 0; color: #94a3b8; }
.help-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.help-table td { padding: 6px 8px; border-bottom: 1px solid var(--border); color: #94a3b8; }
.help-table td:first-child { white-space: nowrap; width: 140px; }
.help-phases { font-size: 13px; line-height: 1.8; color: #94a3b8; padding-left: 20px; }
.help-phases li { margin-bottom: 2px; }
.help-cli {
  background: var(--bg);
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
  color: #94a3b8;
}
`;

// ─── Multi-Project JS ───────────────────────────────────────────

const MULTI_JS = `
// Project tab switching
document.querySelectorAll('.project-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.project-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const project = tab.dataset.project;
    document.querySelectorAll('.tab-content').forEach(c => {
      c.classList.toggle('active', c.dataset.tab === project);
    });
    // Persist active tab in URL hash
    history.replaceState(null, '', '#' + project);
  });
});

// Restore active tab from URL hash on load
(function() {
  var hash = location.hash.replace('#', '');
  if (hash) {
    var tab = document.querySelector('.project-tab[data-project="' + hash + '"]');
    if (tab) tab.click();
  }
})();

// Click on project card -> switch to that tab
document.querySelectorAll('.project-card[data-goto]').forEach(card => {
  card.addEventListener('click', () => {
    const name = card.dataset.goto;
    const tab = document.querySelector('.project-tab[data-project="' + name + '"]');
    if (tab) tab.click();
  });
});

// ─── Action Bar ──────────────────────────────────────────────────
(function() {
  if (!window.__MF_SERVER__) return;

  var badge = document.getElementById('server-badge');
  var batchSelect = document.getElementById('batch-select');
  var btnPreflight = document.getElementById('btn-preflight');
  var btnRun = document.getElementById('btn-run');
  var btnVerify = document.getElementById('btn-verify');
  var btnGaps = document.getElementById('btn-gaps');
  var btnCalibrate = document.getElementById('btn-calibrate');
  var btnGenerate = document.getElementById('btn-generate');
  var btnMigrate = document.getElementById('btn-migrate');
  var btnMigrateAuto = document.getElementById('btn-migrate-auto');
  var btnAnalyze = document.getElementById('btn-analyze');
  var chkDry = document.getElementById('chk-dry');
  var panel = document.getElementById('action-panel');
  var panelTitle = document.getElementById('panel-title');
  var panelContent = document.getElementById('panel-content');
  var btnClose = document.getElementById('btn-close');

  // Activate UI
  badge.textContent = 'Connected';
  badge.className = 'server-badge connected';
  batchSelect.disabled = false;
  btnPreflight.disabled = false;
  btnRun.disabled = false;
  btnVerify.disabled = false;
  btnGaps.disabled = false;
  btnCalibrate.disabled = false;
  btnGenerate.disabled = false;
  btnMigrate.disabled = false;
  btnMigrateAuto.disabled = false;
  btnAnalyze.disabled = false;
  document.getElementById('sel-enrich').disabled = false;
  chkDry.disabled = false;
  [btnPreflight, btnRun, btnVerify, btnGaps, btnCalibrate, btnGenerate, btnMigrate, btnMigrateAuto, btnAnalyze].forEach(function(b) { b.title = ''; });

  function showPanel(title, content) {
    panelTitle.textContent = title;
    panelContent.textContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    panel.classList.add('visible');
  }

  function setLoading(btn, loading) {
    if (loading) {
      btn.dataset.origText = btn.textContent;
      btn.innerHTML = '<span class="action-spinner"></span>' + btn.textContent;
      btn.disabled = true;
    } else {
      btn.textContent = btn.dataset.origText || btn.textContent;
      btn.disabled = false;
    }
  }

  btnClose.addEventListener('click', function() { panel.classList.remove('visible'); });

  // Load batches
  fetch('/api/status').then(function(r) { return r.json(); }).then(function(batches) {
    if (!Array.isArray(batches)) return;
    batches.forEach(function(b) {
      var opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = b.id + ' - ' + b.name + ' (' + b.programCount + ' progs, ' + b.verified + '/' + b.programCount + ' verified)';
      batchSelect.appendChild(opt);
    });
  });

  // Preflight
  btnPreflight.addEventListener('click', function() {
    var batch = batchSelect.value;
    if (!batch) { showPanel('Error', 'Select a batch first'); return; }
    setLoading(btnPreflight, true);
    fetch('/api/preflight?batch=' + encodeURIComponent(batch))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var lines = ['Preflight: ' + data.batchId + ' - ' + data.batchName, ''];
        data.checks.forEach(function(c) {
          lines.push((c.passed ? 'OK' : 'FAIL') + '  ' + c.check + ': ' + c.message);
        });
        if (data.programs.length > 0) {
          lines.push('', 'Programs:');
          data.programs.forEach(function(p) {
            lines.push('  IDE ' + p.id + ' - ' + p.name + ' [' + p.action + ']' + (p.gaps > 0 ? ' (' + p.gaps + ' gaps)' : ''));
          });
        }
        lines.push('', 'Summary: ' + data.summary.willContract + ' contract, ' + data.summary.willVerify + ' verify, ' + data.summary.needsEnrichment + ' enrich, ' + data.summary.alreadyDone + ' done, ' + data.summary.blocked + ' blocked');
        showPanel('Preflight: ' + batch, lines.join('\\n'));
      })
      .finally(function() { setLoading(btnPreflight, false); });
  });

  // Run Pipeline (Streaming SSE)
  btnRun.addEventListener('click', function() {
    var batch = batchSelect.value;
    if (!batch) { showPanel('Error', 'Select a batch first'); return; }
    setLoading(btnRun, true);
    var dryRun = chkDry.checked;
    var url = '/api/pipeline/stream?batch=' + encodeURIComponent(batch) + '&dryRun=' + dryRun;

    panelTitle.textContent = 'Pipeline: ' + batch + (dryRun ? ' (DRY-RUN)' : '');
    panelContent.innerHTML = '<div class="pipeline-progress">'
      + '<div class="progress-bar"><div class="progress-fill" id="pbar"></div></div>'
      + '<div class="p-status" id="pstatus">Connecting...</div>'
      + '<div class="p-log" id="plog"></div></div>';
    panel.classList.add('visible');

    var pbar = document.getElementById('pbar');
    var pstatus = document.getElementById('pstatus');
    var plog = document.getElementById('plog');
    var totalProgs = 0;
    var doneProgs = 0;

    function addLog(text) {
      var line = document.createElement('div');
      line.textContent = text;
      plog.appendChild(line);
      plog.scrollTop = plog.scrollHeight;
    }

    var es = new EventSource(url);

    es.onmessage = function(e) {
      var msg = JSON.parse(e.data);

      if (msg.type === 'preflight') {
        totalProgs = msg.data.programs.length;
        pstatus.textContent = 'Preflight OK: ' + totalProgs + ' programs ('
          + msg.data.summary.alreadyDone + ' done, '
          + msg.data.summary.ready + ' ready)';
        addLog('Preflight: ' + msg.data.summary.ready + ' ready, '
          + msg.data.summary.alreadyDone + ' already done, '
          + msg.data.summary.blocked + ' blocked');
        return;
      }

      if (msg.type === 'stream_end') {
        es.close();
        setLoading(btnRun, false);
        return;
      }

      if (msg.type === 'pipeline_result') {
        var r = msg.data;
        var elapsed = ((new Date(r.completed).getTime() - new Date(r.started).getTime()) / 1000).toFixed(1);
        pbar.style.width = '100%';
        pstatus.textContent = 'Done in ' + elapsed + 's: '
          + r.summary.verified + ' verified, '
          + r.summary.contracted + ' contracted, '
          + r.summary.errors + ' errors';
        addLog('Pipeline completed in ' + elapsed + 's');
        setTimeout(function() { location.reload(); }, 2000);
        return;
      }

      if (msg.type === 'error') {
        addLog('ERROR: ' + (msg.message || ''));
        pstatus.textContent = 'Error: ' + (msg.message || '');
        return;
      }

      doneProgs++;
      var pct = totalProgs > 0 ? Math.round((doneProgs / totalProgs) * 100) : 0;
      pbar.style.width = pct + '%';
      pstatus.textContent = doneProgs + '/' + totalProgs + ' (' + pct + '%) - ' + (msg.message || msg.type);
      addLog('[' + (msg.programId || '') + '] ' + (msg.message || msg.type));
    };

    es.onerror = function() {
      es.close();
      setLoading(btnRun, false);
      addLog('Connection lost');
      pstatus.textContent = 'Connection lost - check server';
    };
  });

  // Verify
  btnVerify.addEventListener('click', function() {
    setLoading(btnVerify, true);
    fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dryRun: chkDry.checked }),
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var lines = ['Verify ' + (data.dryRun ? '(DRY-RUN)' : '') + ' result:', ''];
        lines.push(data.verified + ' verified, ' + data.notReady + ' not ready, ' + data.alreadyVerified + ' already verified');
        if (data.details && data.details.length > 0) {
          lines.push('', 'Details:');
          data.details.forEach(function(d) {
            var line = '  IDE ' + d.id + ': ' + d.status;
            if (d.gaps && d.gaps.length > 0) line += ' (' + d.gaps.length + ' gaps)';
            lines.push(line);
          });
        }
        showPanel('Verify', lines.join('\\n'));
      })
      .finally(function() { setLoading(btnVerify, false); });
  });

  // Gaps
  btnGaps.addEventListener('click', function() {
    setLoading(btnGaps, true);
    fetch('/api/gaps')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var lines = ['Gap Report', ''];
        if (data.contracts.length === 0) {
          lines.push('No gaps found - all contracts are complete!');
        } else {
          data.contracts.forEach(function(cg) {
            var pct = cg.total > 0 ? Math.round((cg.impl / cg.total) * 100) : 0;
            lines.push('IDE ' + cg.id + ' - ' + cg.name + ' [' + cg.pipelineStatus + '] ' + cg.impl + '/' + cg.total + ' (' + pct + '%)');
            cg.gaps.slice(0, 5).forEach(function(g) {
              lines.push('  ' + g.type + ' ' + g.id + ': ' + g.status + (g.notes ? ' - ' + g.notes : ''));
            });
            if (cg.gaps.length > 5) lines.push('  ... and ' + (cg.gaps.length - 5) + ' more');
          });
        }
        lines.push('', 'Total: ' + data.grandTotalGaps + ' gaps (' + data.globalPct + '% complete)');
        showPanel('Gaps', lines.join('\\n'));
      })
      .finally(function() { setLoading(btnGaps, false); });
  });

  // Calibrate
  btnCalibrate.addEventListener('click', function() {
    setLoading(btnCalibrate, true);
    fetch('/api/calibrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dryRun: chkDry.checked }),
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var lines = ['Calibration' + (chkDry.checked ? ' (DRY-RUN)' : ''), ''];
        lines.push('Verified contracts: ' + data.dataPoints);
        lines.push('Previous: ' + data.previousHpp + ' h/pt -> Calibrated: ' + data.calibratedHpp + ' h/pt');
        lines.push('Estimated: ' + data.totalEstimated + 'h | Actual: ' + data.totalActual + 'h');
        lines.push('Accuracy: ' + data.accuracyPct + '%');
        if (data.details && data.details.length > 0) {
          lines.push('', 'Details:');
          data.details.forEach(function(d) {
            lines.push('  IDE ' + d.programId + ': score=' + d.score + ' est=' + d.estimated + 'h act=' + d.actual + 'h');
          });
        }
        showPanel('Calibration', lines.join('\\n'));
      })
      .finally(function() { setLoading(btnCalibrate, false); });
  });

  // Analyze Project
  btnAnalyze.addEventListener('click', function() {
    setLoading(btnAnalyze, true);
    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dryRun: chkDry.checked }),
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var lines = ['Project Analysis: ' + data.projectName, ''];
        lines.push('Live programs: ' + data.totalLivePrograms);
        lines.push('Batches preserved: ' + data.batchesPreserved + ' | Created: ' + data.batchesCreated + ' | Unassigned: ' + data.unassignedCount);
        lines.push('');
        if (data.batches) {
          data.batches.forEach(function(b) {
            var flag = b.isNew ? 'NEW' : 'EXISTING';
            lines.push(b.id + '  ' + b.name + '  [' + b.domain + ']  ' + b.memberCount + ' progs  ' + b.complexityGrade + ' grade  ~' + b.estimatedHours + 'h  ' + flag);
          });
        }
        if (!chkDry.checked) {
          lines.push('', 'Batches persisted. Reloading...');
        }
        showPanel('Project Analysis', lines.join('\\n'));
        if (!chkDry.checked) {
          setTimeout(function() { location.reload(); }, 2000);
        }
      })
      .catch(function(err) { showPanel('Error', String(err)); })
      .finally(function() { setLoading(btnAnalyze, false); });
  });

  // Generate Code (Streaming SSE)
  btnGenerate.addEventListener('click', function() {
    var batch = batchSelect.value;
    if (!batch) { showPanel('Error', 'Select a batch first'); return; }
    var outputDir = prompt('Output directory for generated files:', './adh-web/src');
    if (!outputDir) return;
    setLoading(btnGenerate, true);
    var dryRun = chkDry.checked;
    var enrichMode = document.getElementById('sel-enrich').value || 'none';
    var url = '/api/generate/stream?batch=' + encodeURIComponent(batch) + '&outputDir=' + encodeURIComponent(outputDir) + '&dryRun=' + dryRun + '&enrich=' + enrichMode;

    var enrichLabel = enrichMode !== 'none' ? ' [enrich: ' + enrichMode + ']' : '';
    var lines = ['Code Generation' + (dryRun ? ' (DRY-RUN)' : '') + enrichLabel + ' - Batch ' + batch, 'Output: ' + outputDir, ''];
    showPanel('Generate Code', lines.join('\\n'));

    var es = new EventSource(url);
    es.onmessage = function(ev) {
      var msg = JSON.parse(ev.data);

      if (msg.type === 'stream_end') {
        es.close();
        setLoading(btnGenerate, false);
        return;
      }

      if (msg.type === 'codegen_started') {
        lines.push('Starting: ' + msg.total + ' programs');
      } else if (msg.type === 'codegen_program') {
        lines.push('[' + msg.progress + '] IDE ' + msg.programId + ' ' + msg.programName + ': ' + msg.written + ' written, ' + msg.skipped + ' skipped');
      } else if (msg.type === 'codegen_skip') {
        lines.push('SKIP IDE ' + msg.programId + ': ' + msg.message);
      } else if (msg.type === 'codegen_completed') {
        lines.push('', 'Done: ' + msg.processed + ' programs, ' + msg.totalWritten + ' files ' + (msg.dryRun ? 'would be written' : 'written') + ', ' + msg.totalSkipped + ' skipped');
      } else if (msg.type === 'error') {
        lines.push('ERROR: ' + msg.message);
      }

      panelContent.textContent = lines.join('\\n');
    };

    es.onerror = function() {
      es.close();
      setLoading(btnGenerate, false);
      lines.push('Connection lost');
      panelContent.textContent = lines.join('\\n');
    };
  });

  // ─── Help button ─────────────────────────────────────────────
  var btnHelp = document.getElementById('btn-help');
  var helpOverlay = document.getElementById('help-overlay');
  var helpClose = document.getElementById('help-close');
  if (btnHelp && helpOverlay) {
    btnHelp.addEventListener('click', function() { helpOverlay.classList.add('visible'); });
    helpClose.addEventListener('click', function() { helpOverlay.classList.remove('visible'); });
    helpOverlay.addEventListener('click', function(e) { if (e.target === helpOverlay) helpOverlay.classList.remove('visible'); });
  }

  // ─── Shared helpers ────────────────────────────────────────────
  var migrateOverlay = document.getElementById('migrate-overlay');
  var migrateOverlayTitle = document.getElementById('migrate-overlay-title');
  var migrateOverlayClose = document.getElementById('migrate-overlay-close');

  function formatElapsed(ms) {
    var totalSec = Math.floor(ms / 1000);
    var h = Math.floor(totalSec / 3600);
    var m = Math.floor((totalSec % 3600) / 60);
    var s = totalSec % 60;
    if (h > 0) return h + 'h ' + m + 'm ' + s + 's';
    if (m > 0) return m + 'm ' + s + 's';
    return s + 's';
  }

  var migrateMinimize = document.getElementById('migrate-overlay-minimize');
  var migratePanelToggle = document.getElementById('migrate-panel-toggle');
  var migrateBadge = document.getElementById('migrate-panel-badge');

  // ─── Migration state ──────────────────────────────────────────
  var ALL_PHASES = ['spec','contract','analyze','types','store','api','page','components',
    'tests-unit','tests-ui','verify-tsc','fix-tsc','verify-tests','fix-tests','integrate','review'];

  var migrateState = {
    totalProgs: 0, doneProgs: 0,
    programList: [],
    programPhases: {},
    migrationStart: 0, elapsedTid: 0, logCollapsed: false
  };

  function escAttr(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function showMigrateOverlay(title) {
    migrateOverlayTitle.textContent = title;
    document.getElementById('mp-module-bar').style.width = '0%';
    document.getElementById('mp-module-label').textContent = '0/0 (0%)';
    document.getElementById('mp-elapsed').textContent = '';
    document.getElementById('mp-prog-section').style.display = 'none';
    document.getElementById('mp-grid-section').style.display = 'none';
    document.getElementById('mp-grid-body').innerHTML = '';
    document.getElementById('mp-log').innerHTML = '';
    migrateOverlay.classList.remove('collapsed');
    migrateOverlay.classList.add('visible');
    migrateMinimize.textContent = '_';
    if (migrateBadge) migrateBadge.style.display = 'none';
  }

  function closeMigrateOverlay() {
    migrateOverlay.classList.remove('visible');
    migrateOverlay.classList.remove('collapsed');
  }

  function toggleMigratePanel() {
    migrateOverlay.classList.toggle('collapsed');
    migrateMinimize.textContent = migrateOverlay.classList.contains('collapsed') ? '+' : '_';
  }

  migrateOverlayClose.addEventListener('click', closeMigrateOverlay);
  migrateMinimize.addEventListener('click', function(e) { e.stopPropagation(); toggleMigratePanel(); });
  migratePanelToggle.addEventListener('dblclick', toggleMigratePanel);

  // Log toggle
  var mpLogToggle = document.getElementById('mp-log-toggle');
  mpLogToggle.addEventListener('click', function() {
    var section = document.querySelector('.mp-log-section');
    section.classList.toggle('collapsed');
    migrateState.logCollapsed = section.classList.contains('collapsed');
  });

  function startElapsedTimer(startedAt) {
    var elDiv = document.getElementById('mp-elapsed');
    if (!elDiv) return 0;
    var tid = setInterval(function() {
      var el = document.getElementById('mp-elapsed');
      if (!el) { clearInterval(tid); return; }
      el.textContent = 'Elapsed: ' + formatElapsed(Date.now() - startedAt);
    }, 1000);
    elDiv.textContent = 'Elapsed: ' + formatElapsed(Date.now() - startedAt);
    return tid;
  }

  function addMLog(text) {
    var mlog = document.getElementById('mp-log');
    if (!mlog) return;
    var line = document.createElement('div');
    line.textContent = text;
    mlog.appendChild(line);
    mlog.scrollTop = mlog.scrollHeight;
  }

  // ─── Grid construction ────────────────────────────────────────
  function buildProgramGrid(list) {
    var tbody = document.getElementById('mp-grid-body');
    tbody.innerHTML = '';
    migrateState.programPhases = {};
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      migrateState.programPhases[p.id] = { status: 'pending', currentPhase: null, completedPhases: {} };
      var tr = document.createElement('tr');
      tr.id = 'mp-row-' + p.id;
      var dotsHtml = '';
      for (var j = 0; j < ALL_PHASES.length; j++) {
        dotsHtml += '<span class="mp-dot" data-prog="' + escAttr(p.id) + '" data-phase="' + ALL_PHASES[j] + '" title="' + ALL_PHASES[j] + '"></span>';
      }
      tr.innerHTML = '<td>' + escAttr(p.id) + '</td>'
        + '<td title="' + escAttr(p.name) + '">' + escAttr(p.name) + '</td>'
        + '<td class="mp-icon" id="mp-icon-' + escAttr(p.id) + '">&#9203;</td>'
        + '<td><div class="mp-dots">' + dotsHtml + '</div></td>';
      tbody.appendChild(tr);
    }
    document.getElementById('mp-grid-section').style.display = '';
  }

  function updateProgramIcon(id, status) {
    var el = document.getElementById('mp-icon-' + id);
    if (!el) return;
    var row = document.getElementById('mp-row-' + id);
    if (status === 'running') { el.innerHTML = '&#9654;'; if (row) { row.classList.add('mp-row-active'); row.classList.remove('mp-row-done'); } }
    else if (status === 'done') { el.innerHTML = '&#10003;'; if (row) { row.classList.remove('mp-row-active'); row.classList.add('mp-row-done'); } }
    else if (status === 'failed') { el.innerHTML = '&#10007;'; if (row) { row.classList.remove('mp-row-active'); row.classList.add('mp-row-done'); } }
    else { el.innerHTML = '&#9203;'; }
  }

  function updatePhaseDot(progId, phase, state) {
    var dots = document.querySelectorAll('.mp-dot[data-prog="' + progId + '"][data-phase="' + phase + '"]');
    for (var i = 0; i < dots.length; i++) {
      dots[i].className = 'mp-dot' + (state === 'done' ? ' done' : state === 'active' ? ' active' : state === 'failed' ? ' failed' : '');
    }
  }

  function updateModuleProgress(done, total) {
    var bar = document.getElementById('mp-module-bar');
    var label = document.getElementById('mp-module-label');
    if (!bar || !label) return;
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;
    bar.style.width = pct + '%';
    label.textContent = done + '/' + total + ' programmes (' + pct + '%)';
    if (migrateBadge) { migrateBadge.textContent = done + '/' + total; migrateBadge.style.display = ''; }
  }

  function updateProgramProgress(progId, phase) {
    var section = document.getElementById('mp-prog-section');
    var titleEl = document.getElementById('mp-prog-title');
    var bar = document.getElementById('mp-prog-bar');
    var label = document.getElementById('mp-prog-label');
    if (!section || !titleEl || !bar || !label) return;

    if (!progId) { section.style.display = 'none'; return; }
    section.style.display = '';

    var ps = migrateState.programPhases[progId];
    var progName = '';
    for (var i = 0; i < migrateState.programList.length; i++) {
      if (String(migrateState.programList[i].id) === String(progId)) { progName = migrateState.programList[i].name; break; }
    }

    var phaseIdx = phase ? ALL_PHASES.indexOf(phase) : -1;
    var doneCount = ps ? Object.keys(ps.completedPhases).length : 0;
    var total = ALL_PHASES.length;

    titleEl.textContent = 'IDE ' + progId + ' ' + progName + (phase ? ' (' + (phaseIdx + 1) + '/' + total + ' - ' + phase + ')' : '');
    var pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
    bar.style.width = pct + '%';
    label.textContent = doneCount + '/' + total;
  }

  // ─── Central event dispatch ───────────────────────────────────
  function processMigrateEvent(msg) {
    if (msg.type === 'migrate_started') {
      migrateState.totalProgs = msg.programs || 0;
      migrateState.doneProgs = 0;
      if (msg.programList && msg.programList.length) {
        migrateState.programList = msg.programList;
        buildProgramGrid(msg.programList);
      }
      updateModuleProgress(0, migrateState.totalProgs);
      addMLog('Migration started: ' + migrateState.totalProgs + ' programs');
      return;
    }

    if (msg.type === 'program_started') {
      var pid = msg.programId;
      if (migrateState.programPhases[pid]) {
        migrateState.programPhases[pid].status = 'running';
        migrateState.programPhases[pid].currentPhase = null;
      }
      updateProgramIcon(pid, 'running');
      updateProgramProgress(pid, null);
      addMLog('[start] IDE ' + pid);
      return;
    }

    if (msg.type === 'phase_started') {
      var pid = msg.programId;
      var phase = msg.phase;
      if (migrateState.programPhases[pid]) {
        var prev = migrateState.programPhases[pid].currentPhase;
        if (prev && prev !== phase) {
          migrateState.programPhases[pid].completedPhases[prev] = true;
          updatePhaseDot(pid, prev, 'done');
        }
        migrateState.programPhases[pid].currentPhase = phase;
      }
      if (phase) updatePhaseDot(pid, phase, 'active');
      updateProgramProgress(pid, phase);
      addMLog('[' + (phase || '') + '] ' + (msg.message || ''));
      return;
    }

    if (msg.type === 'phase_completed') {
      var pid = msg.programId;
      var phase = msg.phase;
      if (migrateState.programPhases[pid] && phase) {
        migrateState.programPhases[pid].completedPhases[phase] = true;
        if (migrateState.programPhases[pid].currentPhase === phase) {
          migrateState.programPhases[pid].currentPhase = null;
        }
      }
      if (phase) updatePhaseDot(pid, phase, 'done');
      updateProgramProgress(pid, null);
      addMLog('[' + (phase || '') + '] ' + (msg.message || ''));
      return;
    }

    if (msg.type === 'phase_failed') {
      var pid = msg.programId;
      var phase = msg.phase;
      if (phase) updatePhaseDot(pid, phase, 'failed');
      addMLog('[' + (phase || '') + '] FAIL: ' + (msg.message || ''));
      return;
    }

    if (msg.type === 'program_completed') {
      var pid = msg.programId;
      if (migrateState.programPhases[pid]) {
        // Mark all remaining phases as done (program finished all 10 gen phases)
        var cur = migrateState.programPhases[pid].currentPhase;
        if (cur) { migrateState.programPhases[pid].completedPhases[cur] = true; updatePhaseDot(pid, cur, 'done'); }
        migrateState.programPhases[pid].status = 'done';
        migrateState.programPhases[pid].currentPhase = null;
      }
      updateProgramIcon(pid, 'done');
      migrateState.doneProgs++;
      updateModuleProgress(migrateState.doneProgs, migrateState.totalProgs);
      updateProgramProgress(null, null);
      addMLog('[done] IDE ' + pid + ': ' + (msg.message || ''));
      return;
    }

    if (msg.type === 'program_failed') {
      var pid = msg.programId;
      if (migrateState.programPhases[pid]) {
        var cur = migrateState.programPhases[pid].currentPhase;
        if (cur) updatePhaseDot(pid, cur, 'failed');
        migrateState.programPhases[pid].status = 'failed';
      }
      updateProgramIcon(pid, 'failed');
      migrateState.doneProgs++;
      updateModuleProgress(migrateState.doneProgs, migrateState.totalProgs);
      updateProgramProgress(null, null);
      addMLog('[FAIL] IDE ' + pid + ': ' + (msg.message || ''));
      return;
    }

    if (msg.type === 'migrate_result') {
      var r = msg.data;
      clearInterval(migrateState.elapsedTid);
      var bar = document.getElementById('mp-module-bar');
      if (bar) bar.style.width = '100%';
      var label = document.getElementById('mp-module-label');
      if (label && r && r.summary) {
        label.textContent = 'Done: ' + r.summary.completed + '/' + r.summary.total
          + ' completed, ' + r.summary.totalFiles + ' files'
          + (r.summary.tscClean ? ', TSC clean' : ', TSC errors')
          + (r.summary.testsPass ? ', tests pass' : ', tests fail')
          + ', coverage ' + r.summary.reviewAvgCoverage + '%';
      }
      var elapsed = document.getElementById('mp-elapsed');
      if (elapsed) elapsed.textContent = 'Total: ' + formatElapsed(Date.now() - migrateState.migrationStart);
      if (migrateBadge) { migrateBadge.textContent = 'Done'; migrateBadge.style.background = 'var(--green)'; }
      document.getElementById('mp-prog-section').style.display = 'none';
      addMLog('Migration completed');
      if (r && r.git) addMLog('[git] Committed ' + r.git.commitSha + ' pushed to ' + r.git.branch);
      return;
    }

    if (msg.type === 'stream_end') return;

    if (msg.type === 'error') {
      addMLog('ERROR: ' + (msg.message || ''));
      return;
    }

    // Default: log anything else
    addMLog('[' + (msg.phase || msg.type || '') + '] ' + (msg.message || msg.type || ''));
  }

  // ─── Confirmation modal ──────────────────────────────────────
  var confirmModal = document.getElementById('migrate-confirm-modal');
  var modalCancel = document.getElementById('modal-cancel');
  var modalLaunch = document.getElementById('modal-launch');

  modalCancel.addEventListener('click', function() { confirmModal.classList.remove('visible'); });
  confirmModal.addEventListener('click', function(e) { if (e.target === confirmModal) confirmModal.classList.remove('visible'); });

  function launchMigration(batch, targetDir, parallelCount, claudeMode, dryRun) {
    confirmModal.classList.remove('visible');
    setLoading(btnMigrate, true);

    var url = '/api/migrate/stream?batch=' + encodeURIComponent(batch)
      + '&targetDir=' + encodeURIComponent(targetDir)
      + '&dryRun=' + dryRun
      + '&parallel=' + parallelCount
      + '&mode=' + claudeMode;

    showMigrateOverlay('Migrate: ' + batch + ' [' + claudeMode.toUpperCase() + ']' + (dryRun ? ' (DRY-RUN)' : ''));
    migrateState.migrationStart = Date.now();
    migrateState.elapsedTid = startElapsedTimer(migrateState.migrationStart);
    migrateState.totalProgs = 0;
    migrateState.doneProgs = 0;
    migrateState.programList = [];
    migrateState.programPhases = {};

    var es = new EventSource(url);
    es.onmessage = function(ev) {
      var msg = JSON.parse(ev.data);

      if (msg.type === 'stream_end') {
        es.close();
        clearInterval(migrateState.elapsedTid);
        setLoading(btnMigrate, false);
        return;
      }

      processMigrateEvent(msg);
    };

    es.onerror = function() {
      es.close();
      clearInterval(migrateState.elapsedTid);
      setLoading(btnMigrate, false);
      addMLog('Connection lost');
    };
  }

  // ─── Migrate Module (opens confirmation modal) ────────────────
  btnMigrate.addEventListener('click', function() {
    var batch = batchSelect.value;
    if (!batch) { showPanel('Error', 'Select a batch first'); return; }

    var enrichSel = document.getElementById('sel-enrich').value || 'none';
    var claudeMode = enrichSel === 'claude' ? 'api' : 'cli';
    var dryRun = chkDry.checked;

    // Populate modal
    document.getElementById('modal-batch-info').textContent = batch;
    document.getElementById('modal-target-dir').value = 'adh-web';
    document.getElementById('modal-target-resolved').textContent = '(resolved server-side relative to project root)';
    document.getElementById('modal-parallel').value = '1';
    document.getElementById('modal-claude-mode').textContent = claudeMode.toUpperCase() + ' (enrichment: ' + enrichSel + ')';
    document.getElementById('modal-dry-run').textContent = dryRun ? 'Yes (no files modified)' : 'No (files will be written)';

    // Show modal
    confirmModal.classList.add('visible');

    // Wire launch button (replace handler to avoid duplicates)
    modalLaunch.onclick = function() {
      var targetDir = document.getElementById('modal-target-dir').value || 'adh-web';
      var parallel = document.getElementById('modal-parallel').value || '1';
      launchMigration(batch, targetDir, parallel, claudeMode, dryRun);
    };
  });

  // ─── Migration Auto (skip modal, launch immediately) ─────────
  btnMigrateAuto.addEventListener('click', function() {
    var batch = batchSelect.value;
    if (!batch) { showPanel('Error', 'Select a batch first'); return; }
    var enrichSel = document.getElementById('sel-enrich').value || 'none';
    var claudeMode = enrichSel === 'claude' ? 'api' : 'cli';
    var dryRun = chkDry.checked;
    launchMigration(batch, 'adh-web', '1', claudeMode, dryRun);
  });

  // ─── Reconnect on page load if migration is active ───────────
  fetch('/api/migrate/active').then(function(r) { return r.json(); }).then(function(state) {
    if (!state.running && state.events.length === 0) return;

    var isDone = !state.running;
    showMigrateOverlay('Migrate: ' + state.batch + ' [' + state.mode.toUpperCase() + ']' + (state.dryRun ? ' (DRY-RUN)' : ''));
    setLoading(btnMigrate, !isDone);

    // Set programList first so grid builds during replay
    if (state.programList && state.programList.length) {
      migrateState.programList = state.programList;
    }
    migrateState.migrationStart = state.startedAt;
    migrateState.totalProgs = state.totalPrograms;
    migrateState.doneProgs = 0;

    // Replay buffered events through central dispatch
    state.events.forEach(function(msg) {
      processMigrateEvent(msg);
    });

    // Sync done count from server state
    migrateState.doneProgs = state.completedPrograms;
    updateModuleProgress(state.completedPrograms, state.totalPrograms);

    if (isDone) {
      var elapsed = document.getElementById('mp-elapsed');
      if (elapsed) elapsed.textContent = 'Completed';
      if (migrateBadge) { migrateBadge.textContent = 'Done'; migrateBadge.style.background = 'var(--green)'; }
      return;
    }

    // Live elapsed timer
    migrateState.elapsedTid = startElapsedTimer(state.startedAt);
    var lastEventCount = state.events.length;

    // Poll for updates every 3s
    var pollTid = setInterval(function() {
      fetch('/api/migrate/active').then(function(r) { return r.json(); }).then(function(s) {
        // Process new events only
        for (var i = lastEventCount; i < s.events.length; i++) {
          processMigrateEvent(s.events[i]);
        }
        lastEventCount = s.events.length;

        if (!s.running) {
          clearInterval(pollTid);
          clearInterval(migrateState.elapsedTid);
          setLoading(btnMigrate, false);
          var elapsed = document.getElementById('mp-elapsed');
          if (elapsed) elapsed.textContent = 'Total: ' + formatElapsed(Date.now() - s.startedAt);
          var bar = document.getElementById('mp-module-bar');
          if (bar) bar.style.width = '100%';
          if (migrateBadge) { migrateBadge.textContent = 'Done'; migrateBadge.style.background = 'var(--green)'; }
        }
      });
    }, 3000);
  }).catch(function() { /* server may not support this endpoint yet */ });
})();
`;
