# Plan d'Optimisation Ecosysteme Magic

**Date**: 2026-01-26
**Objectif**: Atteindre 100% efficacite en Migration, Documentation et Debug

---

## PHASES D'IMPLEMENTATION

### Phase 0: Quick Wins (1-2 jours) - PRIORITE IMMEDIATE

| # | Action | Fichier/Outil | Effort | Resultat |
|---|--------|---------------|--------|----------|
| 0.1 | Implementer sync-patterns via C# | `SyncPatternsService.cs` | 4h | Patterns KB synchronises |
| 0.2 | Valider FTS5 patterns_fts | Test requete SQL | 1h | Recherche patterns fonctionnelle |
| 0.3 | Corriger ADH XML invalide | Fichiers source ADH | 3h | 350 programmes accessibles |
| 0.4 | Ajouter hook post-commit sync | `.claude/hooks/` | 2h | Auto-sync a chaque commit |

**Livrable:** `/ticket-search` et `/ticket-analyze` pleinement operationnels

---

### Phase 1: Fondations Strategiques (1 semaine)

| # | Action | Detail | Effort | Resultat |
|---|--------|--------|--------|----------|
| 1.1 | Populator ECF Registry | Parser ProgramHeaders.xml -> shared_components | 10h | 762 composants, impact analysis active |
| 1.2 | Pipeline orchestrateur unifie | Run-TicketPipeline.ps1 complet | 12h | 6 phases auto-enchainees |
| 1.3 | Tests post-generation migration | Validation TypeScript/C# compile | 15h | Code genere = code compilable |
| 1.4 | RecordTicketAnalysis | Enregistrer metriques tickets | 6h | Dashboard efficacite analyse |
| 1.5 | UI Forms automation | Parser controles GUI -> React/HTML | 15h | Migration ecrans automatisee |

**Livrable:** Migration et debug production-ready

---

### Phase 2: Optimisations (2-3 semaines)

| # | Action | Detail | Effort | Resultat |
|---|--------|--------|--------|----------|
| 2.1 | Variable Lineage Generator | Extension BatchIndexer | 15h | Tracabilite valeurs variables |
| 2.2 | Diagrammes flux auto | ASCII flowchart depuis call graph | 8h | Documentation visuelle auto |
| 2.3 | Pattern scoring ameliore | ML sur patterns utilises ensemble | 10h | Suggestions pertinentes |
| 2.4 | Coverage metrics dashboard | Suivi % par module/programme | 6h | Visibilite progression |
| 2.5 | Generateur specs techniques | Markdown depuis KB | 10h | Documentation auto-generee |

**Livrable:** Ecosysteme optimise et mesure

---

### Phase 3: Excellence (1 mois+)

| # | Action | Detail | Effort | Resultat |
|---|--------|--------|--------|----------|
| 3.1 | CI/CD integration | GitHub Actions validation | 15h | Qualite garantie |
| 3.2 | Pattern recommendation engine | Scoring pondere + feedback loop | 20h | Patterns auto-ameliores |
| 3.3 | Fallback sans MCP | Mode degrade parsing XML local | 10h | Resilience offline |
| 3.4 | Performance analyzer | Detection bottlenecks, indexes | 15h | Optimisation proactive |
| 3.5 | Multi-projet migration batch | Orchestration migration 5+ projets | 20h | Migration industrialisee |

**Livrable:** Ecosysteme mature et industrialise

---

## DETAILS IMPLEMENTATION PHASE 0

### 0.1 SyncPatternsService.cs

**Localisation:** `tools/MagicKnowledgeBase/Services/SyncPatternsService.cs`

**Fonctionnalites:**
1. Parser tous les fichiers `.openspec/patterns/*.md`
2. Extraire: pattern_id, domain, symptoms, keywords, solution
3. INSERT/UPDATE dans table `resolution_patterns`
4. Rebuild index FTS5 `patterns_fts`

**Structure pattern Markdown:**
```markdown
# Pattern: [nom]
Source: [ticket]
Domain: [domain]

## Symptomes
- symptome1
- symptome2

## Detection
Keywords: mot1, mot2

## Solution
...
```

**SQL cible:**
```sql
INSERT OR REPLACE INTO resolution_patterns
(pattern_id, domain, symptoms, keywords, solution, source_ticket, usage_count)
VALUES (?, ?, ?, ?, ?, ?, 0);

INSERT INTO patterns_fts (pattern_id, domain, symptoms, keywords, solution)
VALUES (?, ?, ?, ?, ?);
```

### 0.2 Validation FTS5

**Test a executer:**
```sql
-- Verifier table existe
SELECT name FROM sqlite_master WHERE type='table' AND name='patterns_fts';

-- Tester recherche
SELECT * FROM patterns_fts WHERE patterns_fts MATCH 'date format';
```

### 0.3 Fix ADH XML

**Diagnostic:**
```powershell
# Trouver fichiers avec caracteres invalides
Get-ChildItem "D:\Data\Migration\XPA\PMS\ADH\Source\*.xml" | ForEach-Object {
    $content = [System.IO.File]::ReadAllBytes($_.FullName)
    $invalid = $content | Where-Object { $_ -lt 0x20 -and $_ -notin @(0x09, 0x0A, 0x0D) }
    if ($invalid) { $_.Name }
}
```

**Fix:**
```powershell
# Nettoyer caracteres invalides
$content = Get-Content $file -Raw -Encoding UTF8
$clean = $content -replace '[\x00-\x08\x0B\x0C\x0E-\x1F]', ''
Set-Content $file -Value $clean -Encoding UTF8
```

### 0.4 Hook Post-Commit Sync

**Fichier:** `.claude/hooks/sync-patterns-on-commit.ps1`

**Trigger:** Apres chaque commit touchant `.openspec/patterns/`

**Action:** Appeler SyncPatternsService

---

## METRIQUES CIBLES

| Metrique | Actuel | Phase 0 | Phase 1 | Phase 2 | Phase 3 |
|----------|--------|---------|---------|---------|---------|
| Patterns KB sync | 0/12 | 12/12 | 15+ | 25+ | 30+ |
| Programmes analysables | 5,493 | 5,843 | 5,843 | 5,843 | 5,843 |
| Tickets auto-resolus | ~50% | 60% | 70% | 80% | 90% |
| Code migration valide | 0% | 0% | 80% | 90% | 95% |
| Coverage documentation | 75% | 75% | 85% | 90% | 95% |
| ECF Registry | 0/762 | 0/762 | 762/762 | 762/762 | 762/762 |

---

## DEPENDANCES ENTRE PHASES

```
Phase 0.1 (Sync Patterns) ──────┐
                                ├──> Phase 1.2 (Pipeline)
Phase 0.2 (FTS5 Validation) ────┘

Phase 0.3 (Fix ADH) ────────────> Phase 1.1 (ECF Registry)

Phase 1.1 (ECF Registry) ───────> Phase 2.1 (Variable Lineage)
                                   │
Phase 1.4 (Ticket Metrics) ────────┤
                                   ↓
                            Phase 2.3 (Pattern Scoring)
                                   │
                                   ↓
                            Phase 3.2 (Recommendation Engine)
```

---

## RISQUES ET MITIGATIONS

| Risque | Probabilite | Impact | Mitigation |
|--------|-------------|--------|------------|
| ADH XML non reparable | Faible | Haut | Parser tolerant aux erreurs |
| FTS5 incompatible | Tres faible | Haut | Fallback LIKE queries |
| Performance sync | Moyenne | Moyen | Batch processing |
| Breaking changes KB | Faible | Haut | Backup avant migration |

---

## CHECKLIST VALIDATION PHASE 0

- [ ] SyncPatternsService.cs compile sans erreur
- [ ] 12 patterns importes dans resolution_patterns
- [ ] FTS5 patterns_fts retourne resultats
- [ ] ADH projet indexable (350 programmes)
- [ ] Hook post-commit fonctionne
- [ ] /ticket-search retourne patterns pertinents
- [ ] /ticket-analyze suggere patterns

---

*Plan cree le 2026-01-26*
