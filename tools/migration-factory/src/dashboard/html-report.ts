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
  <label style="margin-left:auto;font-size:12px;color:var(--text-dim);display:flex;align-items:center;gap:4px"><input type="checkbox" id="chk-dry" disabled> Dry Run</label>
</div>
<div class="action-panel" id="action-panel">
  <div class="action-panel-header">
    <strong id="panel-title">Results</strong>
    <button class="action-btn" id="btn-close" style="padding:2px 8px;font-size:11px">Close</button>
  </div>
  <pre id="panel-content"></pre>
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
  });
});

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
  chkDry.disabled = false;
  [btnPreflight, btnRun, btnVerify, btnGaps, btnCalibrate, btnGenerate].forEach(function(b) { b.title = ''; });

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

  // Generate Code (Streaming SSE)
  btnGenerate.addEventListener('click', function() {
    var batch = batchSelect.value;
    if (!batch) { showPanel('Error', 'Select a batch first'); return; }
    var outputDir = prompt('Output directory for generated files:', './adh-web/src');
    if (!outputDir) return;
    setLoading(btnGenerate, true);
    var dryRun = chkDry.checked;
    var url = '/api/generate/stream?batch=' + encodeURIComponent(batch) + '&outputDir=' + encodeURIComponent(outputDir) + '&dryRun=' + dryRun;

    var lines = ['Code Generation' + (dryRun ? ' (DRY-RUN)' : '') + ' - Batch ' + batch, 'Output: ' + outputDir, ''];
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
})();
`;
