/**
 * Documentation Section for HTML Report
 * This function generates the complete documentation section with 7 tabs
 */

export const renderDocumentationSection = (): string => `
<section class="card" id="documentation-section">
  <h2>📚 Documentation</h2>

  <div class="doc-tabs">
    <button class="doc-tab active" data-doc-tab="architecture">Architecture</button>
    <button class="doc-tab" data-doc-tab="workflow">Workflow</button>
    <button class="doc-tab" data-doc-tab="spec-pipeline">Spec Pipeline</button>
    <button class="doc-tab" data-doc-tab="specmap">SPECMAP</button>
    <button class="doc-tab" data-doc-tab="packages">Packages</button>
    <button class="doc-tab" data-doc-tab="commands">Commandes</button>
    <button class="doc-tab" data-doc-tab="glossary">Glossaire</button>
  </div>

  <!-- TAB: Architecture -->
  <div class="doc-content active" data-doc-content="architecture">
    <h3>🏗️ Architecture globale</h3>
    <p>Le système de migration Magic Unipaas est composé de 5 packages principaux qui travaillent ensemble pour automatiser la migration des programmes legacy vers des applications web modernes.</p>

    <h4>Composants principaux</h4>
    <table class="doc-table">
      <thead>
        <tr>
          <th>Package</th>
          <th>Technologie</th>
          <th>Rôle</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>spec-pipeline-v72</strong></td>
          <td>PowerShell + MCP</td>
          <td>Génère automatiquement les specs depuis les XML Magic (5 phases)</td>
          <td><span class="doc-badge doc-badge-green">Prod</span></td>
        </tr>
        <tr>
          <td><strong>parser</strong></td>
          <td>TypeScript</td>
          <td>Parse les expressions Magic → AST → TypeScript/C#/Python</td>
          <td><span class="doc-badge doc-badge-green">Stable</span></td>
        </tr>
        <tr>
          <td><strong>factory-cli</strong></td>
          <td>TypeScript</td>
          <td>Pipeline SPECMAP (CONTRACT → ENRICH → VERIFY)</td>
          <td><span class="doc-badge doc-badge-blue">Dev</span></td>
        </tr>
        <tr>
          <td><strong>adh-web</strong></td>
          <td>React 19 + Vite</td>
          <td>Application web migrée (système Caisse)</td>
          <td><span class="doc-badge doc-badge-yellow">Migration</span></td>
        </tr>
        <tr>
          <td><strong>specmap-dashboard</strong></td>
          <td>HTML statique</td>
          <td>Dashboard de progression multi-projets</td>
          <td><span class="doc-badge doc-badge-green">Prod</span></td>
        </tr>
      </tbody>
    </table>

    <h4>Structure des données</h4>
    <div class="doc-highlight">
      <strong>📁 .openspec/</strong> - Dossier central de spécifications
      <ul style="margin-top: 8px;">
        <li><code>specs/</code> - Specs enrichies (212 programmes ADH)</li>
        <li><code>migration/</code> - Données SPECMAP (contracts, live-programs.json)</li>
        <li><code>tickets/</code> - Tickets Jira liés (CMDS-XXX, PMS-XXX)</li>
        <li><code>pipeline-output/</code> - Sorties brutes du spec-pipeline</li>
      </ul>
    </div>
  </div>

  <!-- TAB: Workflow -->
  <div class="doc-content" data-doc-content="workflow">
    <h3>🔄 Workflow complet de migration</h3>
    <p>Le processus de migration suit 4 grandes étapes, de l'analyse du XML Magic jusqu'au code migré vérifié.</p>

    <ol class="doc-steps">
      <li>
        <strong>Génération de la spec</strong>
        <p>Le spec-pipeline analyse le fichier XML Magic et génère une spécification structurée.</p>
        <pre><code>powershell -File tools/spec-pipeline-v72/Run-SpecPipeline.ps1 -Project ADH -IdePosition 237</code></pre>
        <p>Résultat : <code>.openspec/specs/ADH-IDE-237.md</code> (10-50 KB)</p>
      </li>

      <li>
        <strong>Enrichissement par Claude</strong>
        <p>Claude Code analyse la spec et enrichit la section fonctionnelle + génère l'algorigramme métier.</p>
        <pre><code>/spec-pipeline ADH 237</code></pre>
        <p>Améliore : description fonctionnelle par domaines + diagramme Mermaid</p>
      </li>

      <li>
        <strong>Migration SPECMAP</strong>
        <p>Le factory-cli orchestre la migration en 3 phases : CONTRACT → ENRICH → VERIFY</p>
        <pre><code>pnpm --filter @magic-migration/factory contract ADH 237
pnpm --filter @magic-migration/factory enrich ADH 237
pnpm --filter @magic-migration/factory verify ADH 237</code></pre>
      </li>

      <li>
        <strong>Intégration dans adh-web</strong>
        <p>Le code TypeScript généré est intégré dans l'application React (pages, components, stores).</p>
        <pre><code>pnpm --filter @magic-migration/adh-web dev</code></pre>
      </li>
    </ol>

    <h4>États des programmes</h4>
    <table class="doc-table">
      <thead>
        <tr>
          <th>État</th>
          <th>Description</th>
          <th>Prochaine action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="doc-badge doc-badge-yellow">PENDING</span></td>
          <td>Spec générée, pas encore contractée</td>
          <td><code>factory contract</code></td>
        </tr>
        <tr>
          <td><span class="doc-badge doc-badge-orange">CONTRACTED</span></td>
          <td>Contract YAML créé, prêt pour enrichissement</td>
          <td><code>factory enrich</code></td>
        </tr>
        <tr>
          <td><span class="doc-badge doc-badge-blue">ENRICHED</span></td>
          <td>Code TypeScript généré, à vérifier</td>
          <td><code>factory verify</code></td>
        </tr>
        <tr>
          <td><span class="doc-badge doc-badge-green">VERIFIED</span></td>
          <td>Implémentation validée et testée</td>
          <td>Prêt pour déploiement</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- TAB: Spec Pipeline -->
  <div class="doc-content" data-doc-content="spec-pipeline">
    <h3>📝 Spec Pipeline V7.2</h3>
    <p>Le spec-pipeline est un ensemble de scripts PowerShell qui analysent les fichiers XML Magic et génèrent automatiquement des spécifications structurées.</p>

    <h4>Les 5 phases d'analyse</h4>
    <table class="doc-table">
      <thead>
        <tr>
          <th>Phase</th>
          <th>Script</th>
          <th>Fonction</th>
          <th>Sortie</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Discovery</strong></td>
          <td>Phase1-Discovery.ps1</td>
          <td>Analyse la structure du programme (tâches, tables, variables)</td>
          <td>structure.json</td>
        </tr>
        <tr>
          <td><strong>2. Mapping</strong></td>
          <td>Phase2-Mapping.ps1</td>
          <td>Résout les callers/callees, dépendances cross-projet</td>
          <td>mapping.json</td>
        </tr>
        <tr>
          <td><strong>3. Decode</strong></td>
          <td>Phase3-Decode.ps1</td>
          <td>Décode les expressions Magic via MCP (magic_decode_expression)</td>
          <td>decoded.json</td>
        </tr>
        <tr>
          <td><strong>4. UI Forms</strong></td>
          <td>Phase4-UIForms.ps1</td>
          <td>Analyse les écrans et formulaires (DataView, colonnes visibles)</td>
          <td>forms.json</td>
        </tr>
        <tr>
          <td><strong>5. Synthesis</strong></td>
          <td>Phase5-Synthesis.ps1</td>
          <td>Génère le fichier .md final (format 3 onglets)</td>
          <td>ADH-IDE-237.md</td>
        </tr>
      </tbody>
    </table>

    <h4>Utilisation</h4>
    <pre><code># Générer une spec complète
powershell -File tools/spec-pipeline-v72/Run-SpecPipeline.ps1 \\
  -Project ADH \\
  -IdePosition 237

# Batch - régénérer toutes les specs ADH
powershell -File tools/spec-pipeline-v72/Run-BatchADH.ps1

# Enrichir avec Claude (section 2 + algorigramme)
/spec-pipeline ADH 237</code></pre>
  </div>

  <!-- TAB: SPECMAP -->
  <div class="doc-content" data-doc-content="specmap">
    <h3>🎯 SPECMAP - Pipeline de migration</h3>
    <p>SPECMAP (Specification Mapping) est la méthodologie qui transforme les specs enrichies en code moderne vérifié. Le factory-cli implémente ce pipeline en 3 phases.</p>

    <h4>Les 3 phases SPECMAP</h4>
    <table class="doc-table">
      <thead>
        <tr>
          <th>Phase</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>CONTRACT</strong></td>
          <td>Analyse spec + code cible, classifie les éléments (IMPL/PARTIAL/MISSING/N/A), génère contract YAML</td>
        </tr>
        <tr>
          <td><strong>ENRICH</strong></td>
          <td>Génère le code manquant (React pages, Zustand stores, tests Vitest) selon le contract</td>
        </tr>
        <tr>
          <td><strong>VERIFY</strong></td>
          <td>Compare spec vs implémentation, exécute les tests, vérifie la fidélité</td>
        </tr>
      </tbody>
    </table>

    <h4>Commandes factory-cli</h4>
    <table class="doc-table">
      <thead>
        <tr>
          <th>Commande</th>
          <th>Description</th>
          <th>Exemple</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>contract</code></td>
          <td>Analyse spec + code, génère contract YAML</td>
          <td><code>factory contract ADH 237</code></td>
        </tr>
        <tr>
          <td><code>enrich</code></td>
          <td>Génère le code manquant selon contract</td>
          <td><code>factory enrich ADH 237 --mode heuristic</code></td>
        </tr>
        <tr>
          <td><code>verify</code></td>
          <td>Vérifie fidélité spec ↔ code</td>
          <td><code>factory verify ADH 237</code></td>
        </tr>
        <tr>
          <td><code>modules</code></td>
          <td>Liste les modules livrables (100% verified)</td>
          <td><code>factory modules ADH</code></td>
        </tr>
        <tr>
          <td><code>plan</code></td>
          <td>Suggère les batches de migration</td>
          <td><code>factory plan ADH --max-batch 25</code></td>
        </tr>
        <tr>
          <td><code>serve</code></td>
          <td>Lance le serveur HTTP + SSE (dashboard live)</td>
          <td><code>factory serve</code></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- TAB: Packages -->
  <div class="doc-content" data-doc-content="packages">
    <h3>📦 Packages du monorepo</h3>
    <p>Le projet est organisé en monorepo pnpm avec 5 packages interdépendants.</p>

    <h4>1. parser (@magic-migration/parser)</h4>
    <p><strong>Path:</strong> <code>packages/parser/</code><br>
    <strong>Rôle:</strong> Parse les expressions Magic → AST → TypeScript/C#/Python<br>
    <strong>Fonctions:</strong> 300+ fonctions Magic implémentées</p>

    <h4>2. factory-cli (@magic-migration/factory)</h4>
    <p><strong>Path:</strong> <code>packages/factory-cli/</code><br>
    <strong>Rôle:</strong> Pipeline SPECMAP (CONTRACT → ENRICH → VERIFY)<br>
    <strong>Commandes:</strong> 15 commandes CLI<br>
    <strong>Tests:</strong> 458 tests Vitest</p>

    <h4>3. adh-web (@magic-migration/adh-web)</h4>
    <p><strong>Path:</strong> <code>packages/migrations/adh-web/</code><br>
    <strong>Rôle:</strong> Application web migrée (système Caisse ADH)<br>
    <strong>Stack:</strong> React 19, Vite 7, Tailwind v4, Zustand<br>
    <strong>Ports:</strong> 3071 (dev), 3072 (Storybook)</p>

    <h4>4. specmap-dashboard (@magic-migration/dashboard)</h4>
    <p><strong>Path:</strong> <code>packages/specmap-dashboard/</code><br>
    <strong>Rôle:</strong> Dashboard de progression SPECMAP multi-projets<br>
    <strong>Taille:</strong> Standalone HTML (pas de build)</p>

    <h4>5. spec-pipeline-v72</h4>
    <p><strong>Path:</strong> <code>tools/spec-pipeline-v72/</code><br>
    <strong>Rôle:</strong> Générateur automatique de specs depuis XML Magic<br>
    <strong>Phases:</strong> 5 phases (Discovery, Mapping, Decode, UI, Synthesis)</p>
  </div>

  <!-- TAB: Commandes -->
  <div class="doc-content" data-doc-content="commands">
    <h3>🚀 Cheat Sheet - Commandes utiles</h3>

    <h4>Génération de specs</h4>
    <pre><code># Générer une spec complète (5 phases)
powershell -NoProfile -File tools/spec-pipeline-v72/Run-SpecPipeline.ps1 \\
  -Project ADH -IdePosition 237

# Enrichir avec Claude (section 2 + algorigramme)
/spec-pipeline ADH 237

# Batch - régénérer toutes les specs ADH
powershell -NoProfile -File tools/spec-pipeline-v72/Run-BatchADH.ps1</code></pre>

    <h4>Pipeline SPECMAP (factory-cli)</h4>
    <pre><code># Analyser + générer contract
pnpm --filter @magic-migration/factory contract ADH 237

# Enrichir (générer le code manquant)
pnpm --filter @magic-migration/factory enrich ADH 237 --mode heuristic

# Vérifier l'implémentation
pnpm --filter @magic-migration/factory verify ADH 237

# Pipeline complet (contract + enrich + verify)
pnpm --filter @magic-migration/factory run ADH 237

# Lancer le serveur HTTP pour dashboard live
pnpm --filter @magic-migration/factory serve</code></pre>

    <h4>Application adh-web</h4>
    <pre><code># Lancer le dev server (port 3071)
pnpm --filter @magic-migration/adh-web dev

# Tests
pnpm --filter @magic-migration/adh-web test
pnpm --filter @magic-migration/adh-web test:coverage

# Build production
pnpm --filter @magic-migration/adh-web build</code></pre>

    <h4>Dashboard</h4>
    <pre><code># Mettre à jour le dashboard avec les dernières données
powershell -NoProfile -File packages/specmap-dashboard/update-dashboard.ps1

# Lancer un serveur local (port 3070)
pnpm --filter @magic-migration/dashboard dev</code></pre>
  </div>

  <!-- TAB: Glossaire -->
  <div class="doc-content" data-doc-content="glossary">
    <h3>📖 Glossaire</h3>

    <table class="doc-table">
      <thead>
        <tr>
          <th>Terme</th>
          <th>Définition</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>ADH</strong></td>
          <td>Projet Adhérents/Caisse - 135 programmes Magic, système de point de vente Club Med</td>
        </tr>
        <tr>
          <td><strong>AST</strong></td>
          <td>Abstract Syntax Tree - Représentation arborescente du code après parsing</td>
        </tr>
        <tr>
          <td><strong>Batch</strong></td>
          <td>Groupe de programmes traités ensemble par le pipeline (max 25 programmes)</td>
        </tr>
        <tr>
          <td><strong>Callee</strong></td>
          <td>Programme appelé par le programme courant (downstream)</td>
        </tr>
        <tr>
          <td><strong>Caller</strong></td>
          <td>Programme qui appelle le programme courant (upstream)</td>
        </tr>
        <tr>
          <td><strong>Contract YAML</strong></td>
          <td>Fichier de spécification généré par la phase CONTRACT, décrit les gaps et la couverture</td>
        </tr>
        <tr>
          <td><strong>CONTRACTED</strong></td>
          <td>État SPECMAP : contract généré, prêt pour enrichissement</td>
        </tr>
        <tr>
          <td><strong>ENRICHED</strong></td>
          <td>État SPECMAP : code TypeScript généré, à vérifier</td>
        </tr>
        <tr>
          <td><strong>Factory CLI</strong></td>
          <td>Package @magic-migration/factory - CLI qui orchestre le pipeline SPECMAP</td>
        </tr>
        <tr>
          <td><strong>Gap</strong></td>
          <td>Élément manquant dans l'implémentation par rapport à la spec (MISSING ou PARTIAL)</td>
        </tr>
        <tr>
          <td><strong>Livrable</strong></td>
          <td>Module où 100% des programmes sont VERIFIED, prêt pour déploiement</td>
        </tr>
        <tr>
          <td><strong>Magic Unipaas</strong></td>
          <td>Plateforme RAD legacy v12.03 - langage propriétaire avec syntaxe d'expressions unique</td>
        </tr>
        <tr>
          <td><strong>MCP</strong></td>
          <td>Model Context Protocol - Outils Claude pour interroger la Knowledge Base Magic</td>
        </tr>
        <tr>
          <td><strong>Module</strong></td>
          <td>Programme + tous ses callees transitifs (arbre complet de dépendances)</td>
        </tr>
        <tr>
          <td><strong>N/A</strong></td>
          <td>État SPECMAP : non applicable (backend-only, pas de UI à migrer)</td>
        </tr>
        <tr>
          <td><strong>Orphelin</strong></td>
          <td>Programme jamais appelé (0 callers, pas de PublicName, pas dans ECF partagé)</td>
        </tr>
        <tr>
          <td><strong>PENDING</strong></td>
          <td>État SPECMAP : spec générée mais pas encore contractée</td>
        </tr>
        <tr>
          <td><strong>Spec</strong></td>
          <td>Spécification technique d'un programme Magic, générée par spec-pipeline-v72</td>
        </tr>
        <tr>
          <td><strong>SPECMAP</strong></td>
          <td>Specification Mapping - Méthodologie de migration en 3 phases (CONTRACT → ENRICH → VERIFY)</td>
        </tr>
        <tr>
          <td><strong>VERIFIED</strong></td>
          <td>État SPECMAP : implémentation validée par tests et vérifications, prêt pour prod</td>
        </tr>
        <tr>
          <td><strong>Wave</strong></td>
          <td>Vague de migration - Groupe de modules migrables en parallèle (même niveau de dépendance)</td>
        </tr>
      </tbody>
    </table>
  </div>

</section>
`;

export const DOC_CSS = `
/* Documentation tabs */
.doc-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--border);
  overflow-x: auto;
}
.doc-tab {
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
  margin-bottom: -2px;
}
.doc-tab:hover {
  color: var(--text);
  background: rgba(88,166,255,0.05);
}
.doc-tab.active {
  color: var(--blue);
  border-bottom-color: var(--blue);
}
.doc-content {
  display: none;
}
.doc-content.active {
  display: block;
}
.doc-content h3 {
  font-size: 18px;
  margin: 20px 0 12px 0;
  color: var(--text);
  border-left: 3px solid var(--blue);
  padding-left: 12px;
}
.doc-content h4 {
  font-size: 15px;
  margin: 16px 0 8px 0;
  color: var(--text);
}
.doc-content p {
  margin: 8px 0;
  line-height: 1.6;
  color: var(--text-dim);
}
.doc-content ul, .doc-content ol {
  margin: 8px 0 8px 20px;
  color: var(--text-dim);
}
.doc-content li {
  margin: 4px 0;
}
.doc-content code {
  background: rgba(88,166,255,0.1);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  color: var(--blue);
  font-family: 'Consolas', 'Monaco', monospace;
}
.doc-content pre {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 12px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
  margin: 12px 0;
}
.doc-content pre code {
  background: none;
  padding: 0;
  color: var(--text);
}
.doc-table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 13px;
}
.doc-table th {
  background: var(--bg);
  padding: 8px 12px;
  text-align: left;
  border-bottom: 2px solid var(--border);
  color: var(--text);
  font-weight: 600;
}
.doc-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  color: var(--text-dim);
}
.doc-table tr:hover {
  background: rgba(88,166,255,0.05);
}
.doc-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}
.doc-badge-blue { background: rgba(88,166,255,0.2); color: var(--blue); }
.doc-badge-green { background: rgba(63,185,80,0.2); color: var(--green); }
.doc-badge-purple { background: rgba(188,140,255,0.2); color: var(--purple); }
.doc-badge-yellow { background: rgba(210,153,34,0.2); color: var(--yellow); }
.doc-badge-orange { background: rgba(240,136,62,0.2); color: var(--orange); }
.doc-highlight {
  background: rgba(88,166,255,0.1);
  border-left: 3px solid var(--blue);
  padding: 12px 16px;
  margin: 12px 0;
  border-radius: 4px;
}
.doc-steps {
  counter-reset: step-counter;
  list-style: none;
  margin-left: 0;
}
.doc-steps > li {
  counter-increment: step-counter;
  position: relative;
  padding-left: 40px;
  margin: 16px 0;
}
.doc-steps > li::before {
  content: counter(step-counter);
  position: absolute;
  left: 0;
  top: 0;
  background: var(--blue);
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}
`;

export const DOC_JS = `
// Documentation tabs management
(function() {
  const docTabs = document.querySelectorAll('.doc-tab');
  const docContents = document.querySelectorAll('.doc-content');

  docTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-doc-tab');

      // Remove active from all tabs and contents
      docTabs.forEach(t => t.classList.remove('active'));
      docContents.forEach(c => c.classList.remove('active'));

      // Add active to clicked tab and corresponding content
      this.classList.add('active');
      const targetContent = document.querySelector(\`[data-doc-content="\${targetTab}"]\`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
})();
`;
