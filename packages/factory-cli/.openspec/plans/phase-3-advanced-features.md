# Plan Phase 3 - Advanced Features (SWARM)

> **Contexte**: Phase 2 complétée (Agent Implementation G1-G4). Phase 3 complète les fonctionnalités avancées.

## Vue d'ensemble

| Chantier | Description | Effort | Priorité |
|----------|-------------|--------|----------|
| **H - Double Vote** | Implémenter le système de double vote pour programmes critiques | 2-3j | P0 |
| **I - Escalation Complete** | Compléter le système d'escalation + workflow résolution | 2-3j | P0 |
| **J - Analytics Production** | Activer analytics (résoudre better-sqlite3) + CLI | 2-3j | P1 |
| **K - Performance** | Optimisations token usage, caching, parallélisation | 2-3j | P2 |

**Effort total**: 8-12 jours (2-3 semaines)

---

## Chantier H - Double Vote System (P0)

### Objectif
Implémenter le système de double vote pour programmes critiques (payment, security, compliance).

### État actuel
- ✅ Code `double-vote.ts` complet (executeDoubleVote, compareVoteRounds, formatDoubleVoteReport)
- ❌ Orchestrator utilise un stub (ligne 478-497)
- ❌ Aucun test
- ❌ Pas de storage des double votes en DB

### Tâches

#### H1 - Intégration Orchestrator (6h)
**Fichiers**:
- `src/swarm/orchestrator.ts` (méthode executeDoubleVote)
- `src/swarm/storage/sqlite-store.ts` (storeDoubleVote)

**Actions**:
1. Remplacer stub executeDoubleVote() par vraie implémentation
2. Après consensus.passed pour programme critique:
   - Simuler implémentation (ou utiliser code généré si G5 existe)
   - Collecter second round de votes
   - Appeler executeDoubleVote()
   - Stocker résultat dans session.doubleVote
3. Ajouter table `double_votes` en DB:
   ```sql
   CREATE TABLE double_votes (
     id TEXT PRIMARY KEY,
     session_id TEXT NOT NULL,
     first_vote_score REAL,
     second_vote_score REAL,
     implementation TEXT,
     approved INTEGER,
     recommendation TEXT,
     reason TEXT,
     created_at DATETIME,
     FOREIGN KEY (session_id) REFERENCES swarm_sessions(id)
   );
   ```
4. Implémenter `store.storeDoubleVote(sessionId, doubleVoteResult)`

**Tests**:
- Consensus passe première fois → double vote triggered
- Double vote pass/pass → APPROVED
- Double vote pass/fail → NEEDS_REVISION
- Double vote fail/pass → impossible (premier vote échoue)
- Double vote fail/fail → REJECTED

#### H2 - Tests Double Vote (4h)
**Fichiers**:
- `tests/swarm/double-vote.test.ts` (nouveau)
- `tests/swarm/integration/swarm-integration-double-vote.test.ts` (nouveau)

**Tests unitaires** (double-vote.test.ts):
1. `executeDoubleVote()` - 5 scénarios de résultat
2. `compareVoteRounds()` - improved/declined/consistent
3. `formatDoubleVoteReport()` - format markdown correct
4. `validateDoubleVoteSession()` - validation structure

**Tests intégration** (swarm-integration-double-vote.test.ts):
1. Programme critique (isCritical=true) déclenche double vote
2. Première vote passe → implémentation → seconde vote
3. Les deux votes utilisent threshold CRITICAL (80%)
4. Agent change de vote entre rounds (compare)
5. Double vote stocké en DB avec bon status
6. Report markdown généré avec les deux votes

**Couverture**: 100% de double-vote.ts

#### H3 - Validation E2E (2h)
**Fichiers**:
- `tests/swarm/e2e/double-vote-e2e.test.ts` (nouveau)

**Scénarios**:
1. Programme "Payment Processing" (critical) → double vote automatique
2. Agent ARCHITECT approve première fois, rejette seconde → NEEDS_REVISION
3. Tous agents approve les deux fois → APPROVED
4. Session DB contient double_vote_id référence
5. Report markdown exporté dans outputFiles

**Acceptance Criteria**:
- [x] executeDoubleVote() intégré dans orchestrator
- [x] Double votes stockés en DB
- [x] Tests unitaires 100% coverage
- [x] Tests E2E passent
- [x] Documentation API à jour

---

## Chantier I - Escalation Complete (P0)

### Objectif
Compléter le système d'escalation avec workflow de résolution et CLI.

### État actuel
- ✅ EscalationManager implémenté (shouldEscalate, buildContext, generateReport)
- ✅ Intégré dans orchestrator (D1)
- ✅ Stockage de base (via completeSession)
- ❌ extractDivergentViews() est un stub (retourne [])
- ❌ Pas de tests complets
- ❌ Pas de CLI pour visualiser/gérer escalations
- ❌ Pas de workflow résolution

### Tâches

#### I1 - Compléter EscalationManager (4h)
**Fichiers**:
- `src/swarm/escalation/escalation-manager.ts`

**Actions**:
1. **Implémenter extractDivergentViews()** (actuellement stub ligne 290-306):
   - Analyser les votes de la session
   - Grouper justifications similaires par agent
   - Identifier vues divergentes (agents avec positions opposées)
   - Exemple: ARCHITECT approve (performance ok) vs REVIEWER rejette (security concern)

2. **Ajouter méthodes d'analyse**:
   ```typescript
   /**
    * Analyze voting patterns to find root cause of failure
    */
   analyzeVotingPatterns(session: SwarmSession): {
     consensusAgents: AgentRole[];
     dissentingAgents: AgentRole[];
     vetoingAgents: AgentRole[];
     mainBlockers: AgentConcern[];
   }

   /**
    * Calculate escalation urgency level
    */
   calculateUrgency(context: EscalationContext): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
   ```

3. **Enrichir rapport d'escalation**:
   - Ajouter section "Voting Patterns"
   - Ajouter "Urgency Level"
   - Améliorer "Suggested Actions" avec détails spécifiques

#### I2 - Tests EscalationManager (4h)
**Fichiers**:
- `tests/swarm/escalation/escalation-manager.test.ts` (nouveau)

**Tests**:
1. `shouldEscalate()` - 4 scénarios (MAX_ROUNDS, STAGNATION, PERSISTENT_VETO, CRITICAL_CONCERNS)
2. `buildEscalationContext()` - structure complète avec tous les champs
3. `generateEscalationReport()` - recommendation correcte selon reason
4. `extractDivergentViews()` - identifie oppositions entre agents
5. `analyzeVotingPatterns()` - patterns consensus/dissenting/veto
6. `calculateUrgency()` - niveau approprié selon contexte
7. `storeEscalation()` - persistance en DB

**Couverture**: 100% de escalation-manager.ts

#### I3 - CLI Escalation Commands (4h)
**Fichiers**:
- `src/cli.ts` (ajouter commandes)
- `src/commands/swarm-escalations.ts` (nouveau)

**Commandes**:
```bash
# Lister toutes les escalations
factory swarm:escalations list [--status PENDING|REVIEWED|RESOLVED]

# Voir détail d'une escalation
factory swarm:escalations show <session-id>

# Exporter rapport markdown
factory swarm:escalations export <session-id> [--output file.md]

# Marquer comme reviewé
factory swarm:escalations review <session-id> --decision APPROVE|REJECT|REWORK --comment "..."

# Stats escalations
factory swarm:escalations stats
```

**Output exemple**:
```
📊 Escalation Statistics (last 30 days)

Total Escalations: 15
├─ MAX_ROUNDS: 7 (47%)
├─ STAGNATION: 5 (33%)
├─ PERSISTENT_VETO: 2 (13%)
└─ CRITICAL_CONCERNS: 1 (7%)

Status:
├─ PENDING: 3
├─ REVIEWED: 8
└─ RESOLVED: 4

Top Programs Escalated:
1. Payment_Processor (ID: 237) - 3 times
2. Auth_Module (ID: 89) - 2 times
3. Security_Validator (ID: 156) - 2 times
```

#### I4 - Workflow Résolution (4h)
**Fichiers**:
- `src/swarm/escalation/resolution-workflow.ts` (nouveau)
- `src/swarm/storage/sqlite-store.ts` (méthodes escalation)

**DB Schema**:
```sql
-- Ajouter colonnes à swarm_sessions
ALTER TABLE swarm_sessions ADD COLUMN escalation_status TEXT; -- PENDING, REVIEWED, RESOLVED
ALTER TABLE swarm_sessions ADD COLUMN escalation_decision TEXT; -- APPROVE, REJECT, REWORK
ALTER TABLE swarm_sessions ADD COLUMN escalation_reviewer TEXT;
ALTER TABLE swarm_sessions ADD COLUMN escalation_reviewed_at DATETIME;
ALTER TABLE swarm_sessions ADD COLUMN escalation_comment TEXT;
```

**Workflow**:
1. Session escalated → status = 'PENDING'
2. Human review → status = 'REVIEWED' + decision + comment
3. If APPROVE → re-run migration with human-approved changes
4. If REJECT → mark program as FAILED
5. If REWORK → create ticket for manual migration

**API**:
```typescript
export class ResolutionWorkflow {
  reviewEscalation(sessionId: string, decision: 'APPROVE' | 'REJECT' | 'REWORK', reviewer: string, comment: string): void
  resolveEscalation(sessionId: string, resolution: string): void
  getEscalationWorkflowStatus(sessionId: string): EscalationWorkflowStatus
}
```

**Tests**:
- Review escalation → status updated
- Approve → can re-run migration
- Reject → session marked FAILED
- Rework → generates ticket

**Acceptance Criteria**:
- [x] extractDivergentViews() implémenté
- [x] Tests EscalationManager 100% coverage
- [x] CLI commands fonctionnels
- [x] Workflow résolution complet
- [x] DB schema mis à jour

---

## Chantier J - Analytics Production (P1)

### Objectif
Rendre le système analytics opérationnel en production avec CLI et résolution du problème better-sqlite3.

### État actuel
- ✅ MetricsCalculator complet
- ✅ ReportGenerator complet
- ❌ Tests skippés (better-sqlite3 native bindings not found)
- ❌ Pas de CLI pour générer reports
- ❌ Pas de dashboard interactif

### Tâches

#### J1 - Résoudre better-sqlite3 (2h)
**Problème actuel**:
```
Error: Could not locate the bindings file. Tried:
→ D:\Projects\ClubMed\LecteurMagic\packages\factory-cli\build\Release\better_sqlite3.node
```

**Solutions possibles**:

**Option 1: Installer better-sqlite3 correctement**
```bash
cd packages/factory-cli
pnpm remove better-sqlite3
pnpm add better-sqlite3
pnpm rebuild better-sqlite3
```

**Option 2: Utiliser une alternative (Bun, Node native)**
- Remplacer better-sqlite3 par `@neon/serverless` (Postgres)
- Ou utiliser `sqlite3` (package npm différent)
- Ou migrer vers Bun qui supporte SQLite nativement

**Option 3: Mock pour tests uniquement**
- Garder MockSwarmStore pour tests
- Utiliser vrai SQLite uniquement en production
- Ajouter flag `USE_MOCK_STORE=true` pour tests CI

**Recommandation**: Option 1 d'abord, sinon Option 3 (pragmatique)

**Actions**:
1. Essayer pnpm rebuild
2. Vérifier architecture (x64 vs ARM)
3. Si échec → implémenter Option 3 (flag environnement)
4. Retirer `.skip` des tests analytics

#### J2 - Tests Analytics (4h)
**Fichiers**:
- `tests/swarm/analytics-metrics.test.ts` (retirer .skip)
- `tests/swarm/analytics-reports.test.ts` (retirer .skip)

**Actions**:
1. Résoudre better-sqlite3 ou utiliser MockSwarmStore
2. Vérifier tous les tests passent (actuellement 14 skipped)
3. Ajouter tests manquants:
   - Time range filtering
   - Empty database handling
   - Pattern identification (veto agents, low confidence)
   - Markdown formatting edge cases

**Couverture cible**: 90%+ pour metrics-calculator.ts et report-generator.ts

#### J3 - CLI Analytics Commands (4h)
**Fichiers**:
- `src/commands/swarm-analytics.ts` (nouveau)
- `src/cli.ts` (ajouter commandes)

**Commandes**:
```bash
# Générer rapport analytics
factory swarm:analytics report [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--format md|json]

# Exporter rapport dans un fichier
factory swarm:analytics report --output report.md

# Stats rapides
factory swarm:analytics stats

# Métriques agents
factory swarm:analytics agents [--sort votes|confidence|vetos]

# Top escalations
factory swarm:analytics escalations [--limit 10]

# Trends par round
factory swarm:analytics trends
```

**Output exemple** (stats):
```
📊 SWARM Analytics (last 7 days)

Sessions:
├─ Total: 42
├─ Completed: 35 (83%)
├─ Failed: 3 (7%)
└─ Escalated: 4 (10%)

Performance:
├─ Avg Consensus: 76.5%
├─ Avg Rounds: 2.3
├─ Avg Duration: 45.2s
└─ Total Cost: $12.34

Agent Performance:
├─ ARCHITECT: 42 votes, 85% confidence, 2 vetos
├─ ANALYST: 42 votes, 88% confidence, 1 veto
├─ DEVELOPER: 42 votes, 82% confidence, 0 vetos
├─ TESTER: 42 votes, 79% confidence, 3 vetos
├─ REVIEWER: 42 votes, 90% confidence, 5 vetos
└─ DOCUMENTOR: 42 votes, 75% confidence, 0 vetos

Trends:
Round 1: 65% consensus (12 passed, 30 failed)
Round 2: 80% consensus (28 passed, 14 failed)
Round 3: 85% consensus (35 passed, 7 failed)
```

#### J4 - Dashboard Interactif (Optionnel, 8h)
**Technologie**: CLI interactif avec `ink` (React for CLI) ou TUI avec `blessed`

**Écrans**:
1. **Overview Dashboard**
   - Sessions count (donut chart)
   - Success rate gauge
   - Cost trend (sparkline)
   - Recent escalations list

2. **Agent Performance**
   - Agent comparison table
   - Vote distribution (bar chart)
   - Confidence trends (line chart)

3. **Trends Analysis**
   - Consensus by round (line chart)
   - Complexity distribution (bar chart)
   - Time series (sparkline)

**Commande**:
```bash
factory swarm:dashboard
```

**Note**: Optionnel - peut être Phase 4

**Acceptance Criteria**:
- [x] better-sqlite3 fonctionnel OU mock flag implémenté
- [x] Tests analytics activés (14 tests passent)
- [x] CLI commands fonctionnels
- [x] Reports markdown générés correctement
- [ ] Dashboard interactif (optionnel)

---

## Chantier K - Performance Optimizations (P2)

### Objectif
Optimiser les performances SWARM pour réduire coûts et latence.

### Tâches

#### K1 - Token Usage Optimization (4h)
**Objectifs**:
- Réduire token count de 20-30%
- Caching des prompts répétés
- Compression du contexte

**Actions**:
1. **Prompt Caching** (Anthropic Prompt Caching):
   ```typescript
   // Marquer les parties statiques pour caching
   {
     role: 'system',
     content: [
       { type: 'text', text: ARCHITECT_PROMPT, cache_control: { type: 'ephemeral' } }
     ]
   }
   ```
   - Économie: 90% sur prompts cachés (valide 5 min)
   - Applicable aux agent prompts (statiques)

2. **Context Compression**:
   - Round N>1: ne pas répéter tout le contrat
   - Envoyer seulement diff depuis round précédent
   - Résumé des votes précédents (pas full votes)

3. **Selective Agent Activation**:
   - Si consensus >90% au round 1 → skip DOCUMENTOR (poids 0.5)
   - Si no security concerns → skip partial REVIEWER analysis
   - Économie: 10-15% tokens sur programmes simples

**Tests**:
- Mesurer token count avant/après
- Vérifier qualité votes identique
- Valider prompt caching fonctionne

#### K2 - Parallel Agent Execution (3h)
**Objectif**: Réduire latence de 30-40%

**État actuel**: Les 6 agents s'exécutent déjà en parallèle (maxConcurrentAgents=6)

**Optimisations**:
1. **Streaming Responses**:
   - Utiliser SSE (Server-Sent Events) pour streamer votes
   - Afficher votes au fur et à mesure (pas attendre les 6)

2. **Early Consensus Detection**:
   - Si 4 agents votent et score déjà >threshold → arrêter les 2 restants
   - Économie: 33% tokens sur certains cas

3. **Adaptive Timeouts**:
   - Timeout court pour agents légers (DOCUMENTOR: 10s)
   - Timeout long pour agents lourds (ARCHITECT: 30s)

**Tests**:
- Mesurer latence avant/après
- Vérifier early stop ne dégrade pas qualité
- Valider timeout adaptatif

#### K3 - Database Indexing (2h)
**Objectifs**:
- Requêtes analytics 10x plus rapides
- Scalabilité 1000+ sessions

**Actions**:
1. **Ajouter indexes SQL**:
   ```sql
   -- Sessions
   CREATE INDEX idx_sessions_status ON swarm_sessions(status);
   CREATE INDEX idx_sessions_program_id ON swarm_sessions(program_id);
   CREATE INDEX idx_sessions_started_at ON swarm_sessions(started_at);

   -- Votes
   CREATE INDEX idx_votes_round_id ON agent_votes(round_id);
   CREATE INDEX idx_votes_agent ON agent_votes(agent);

   -- Rounds
   CREATE INDEX idx_rounds_session_id ON voting_rounds(session_id);
   CREATE INDEX idx_rounds_number ON voting_rounds(round_number);
   ```

2. **Query Optimization**:
   - Utiliser JOIN au lieu de multiple queries
   - Ajouter EXPLAIN QUERY PLAN pour requêtes lentes
   - Caching des metrics (TTL 5 min)

**Tests**:
- Benchmark queries avant/après
- Vérifier performance avec 1000 sessions

#### K4 - Cost Monitoring (3h)
**Objectifs**:
- Tracking précis des coûts par session
- Alertes si budget dépassé
- Dashboard coûts

**Actions**:
1. **Enhanced Cost Tracking**:
   ```typescript
   interface TokenCost {
     inputTokens: number;
     outputTokens: number;
     cachedTokens: number; // Nouveau
     totalCost: number;
     model: string;
     timestamp: Date;
   }
   ```

2. **Budget Guards**:
   ```typescript
   // Config
   maxCostPerSession: 5.00, // $5 max par session
   dailyBudget: 100.00, // $100 max par jour

   // Runtime check
   if (session.totalCost > config.maxCostPerSession) {
     throw new BudgetExceededError('Session budget exceeded');
   }
   ```

3. **Cost Dashboard**:
   ```bash
   factory swarm:costs
   # Today: $45.32 / $100 (45%)
   # This week: $234.12 / $500 (47%)
   # Avg per session: $2.15
   # Most expensive: Payment_Processor ($8.43)
   ```

**Tests**:
- Vérifier coûts trackés précisément
- Valider budget guards bloquent si dépassement
- Dashboard affiche bonnes données

**Acceptance Criteria**:
- [x] Token usage réduit 20-30%
- [x] Latence réduite 30-40%
- [x] DB indexé, queries 10x plus rapides
- [x] Cost monitoring opérationnel

---

## Timeline & Priorisation

### Sprint 1 (5 jours) - P0 Features
| Jour | Chantier | Tâches |
|------|----------|--------|
| J1 | H1 | Intégration Double Vote Orchestrator |
| J2 | H2 + H3 | Tests Double Vote |
| J3 | I1 | Compléter EscalationManager |
| J4 | I2 | Tests EscalationManager |
| J5 | I3 + I4 | CLI Escalation + Workflow |

### Sprint 2 (4 jours) - P1 Features
| Jour | Chantier | Tâches |
|------|----------|--------|
| J6 | J1 | Résoudre better-sqlite3 |
| J7 | J2 | Tests Analytics |
| J8 | J3 | CLI Analytics Commands |
| J9 | K1 | Token Usage Optimization |

### Sprint 3 (3 jours) - P2 Features (Optionnel)
| Jour | Chantier | Tâches |
|------|----------|--------|
| J10 | K2 | Parallel Agent Execution |
| J11 | K3 | Database Indexing |
| J12 | K4 | Cost Monitoring |

---

## Métriques de succès

| Métrique | Baseline (Phase 2) | Target (Phase 3) |
|----------|-------------------|------------------|
| Test Coverage | 58/58 (100%) | 90/90 (100%) |
| Double Vote Tests | 0 | 15+ tests |
| Escalation Tests | 0 | 20+ tests |
| Analytics Tests | 14 skipped | 14 passing |
| Token Usage | 100% | 70-80% |
| Latency | 100% | 60-70% |
| DB Query Time | Baseline | 10x faster |
| Cost Tracking | Manual | Automated |

---

## Risques & Mitigation

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| better-sqlite3 ne fonctionne pas | Bloquant | Moyen | Option 3: Mock flag pour tests |
| Double vote complexité LLM | Retard | Faible | Stub simple d'abord, améliorer après |
| Prompt caching instable | Performance | Faible | Mesurer avant/après, rollback si problème |
| Budget dépassé durant tests | Coût | Moyen | Budget guards dès K4, monitoring early |

---

## Phase 4 (Future)

Fonctionnalités à considérer après Phase 3:

1. **Senior Agent Escalation**
   - Agent LLM senior (Opus) pour résoudre escalations
   - Context plus large, meilleure reasoning

2. **Learning System**
   - ML model pour prédire échec de consensus
   - Suggestions de revisions automatiques

3. **Multi-Model Support**
   - Support GPT-4, Gemini en plus de Claude
   - Agent ensembles (mix models)

4. **Dashboard Web**
   - React dashboard avec charts interactifs
   - Real-time monitoring via WebSocket
   - Historical trends visualization

5. **CI/CD Integration**
   - GitHub Action pour SWARM
   - Auto-escalation dans Jira/Linear
   - Slack notifications

---

## Checklist Pre-Production

Avant de considérer Phase 3 "Production Ready":

### Fonctionnalités
- [ ] Double vote implémenté et testé
- [ ] Escalation workflow complet
- [ ] Analytics CLI fonctionnel
- [ ] Performance optimisée (token, latence, DB)

### Tests
- [ ] 100% coverage sur nouveau code
- [ ] Integration tests E2E passent
- [ ] Load testing avec 100+ sessions
- [ ] Cost monitoring validé

### Documentation
- [ ] README mis à jour avec nouveaux commands
- [ ] API docs pour nouvelles interfaces
- [ ] Guide troubleshooting escalations
- [ ] Performance tuning guide

### Monitoring
- [ ] Logs structurés (pino)
- [ ] Metrics exportées (Prometheus?)
- [ ] Alertes configurées (coûts, erreurs)
- [ ] Dashboard analytics accessible

---

## Conclusion

Phase 3 complète SWARM avec:
- ✅ Double vote pour programmes critiques
- ✅ Escalation workflow robuste
- ✅ Analytics production-ready
- ✅ Performance optimisée

**Durée estimée**: 2-3 semaines (8-12 jours)
**Priorité**: P0 (H+I) → P1 (J) → P2 (K)
**Après Phase 3**: SWARM fully production-ready 🚀
