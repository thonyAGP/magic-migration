# Migration Magic Unipaas - OpenSpec

## Vue d'ensemble

Agent Claude Code specialise pour l'analyse et la migration d'applications Magic Unipaas v12.03 vers des langages modernes (TypeScript, C#, Python).

**Skill principal**: `skills/magic-unipaas/SKILL.md`

## Architecture

### Projets Magic Sources

| Projet | Chemin | Programmes | Role | Statut |
|--------|--------|------------|------|--------|
| REF | `D:\Data\Migration\XPA\PMS\REF\Source\` | ~700 | Reference (tables partagees) | Actif |
| PBP | `D:\Data\Migration\XPA\PMS\PBP\Source\` | ~430 | Editions/Exports | MECANO valide |
| ADH | `D:\Data\Migration\XPA\PMS\ADH\Source\` | 350 | Adherents/Caisse | **Migre 85.5%** |
| PBG | `D:\Data\Migration\XPA\PMS\PBG\Source\` | 394 | Planification/Batch (arrivees, logements) | Explore |
| PVE | `D:\Data\Migration\XPA\PMS\PVE\Source\` | 448 | Point de Vente/POS (TPE, stocks, Mobile POS) | Explore |
| VIL | `D:\Data\Migration\XPA\PMS\VIL\Source\` | ~600 | Village (editions, recapitulatifs, sessions PMS) | Bug analysé |

### Composants Partages (ECF)

| Composant | Fichier | Utilise par | Contenu |
|-----------|---------|-------------|---------|
| REF.ecf | `%club_prog%REF.ecf` | ADH, PBP, PVE | Tables (~1000) + Programmes (~30) |
| ADH.ecf | `%club_prog%ADH.ecf` | PBP, PVE | 30 programmes partages |
| UTILS.ecf | `%club_prog%UTILS.ecf` | ADH | 1 programme (Calendrier .NET) |

### Programmes ADH Partages (ADH.ecf)

Composant "Sessions_Reprises" - 30 programmes:

| ID | Nom Public | Domaine |
|----|------------|---------|
| 27 | Separation | Compte |
| 28 | Fusion | Compte |
| 53 | EXTRAIT_EASY_CHECKOUT | Easy Checkout |
| 54 | FACTURES_CHECK_OUT | Factures |
| 64 | SOLDE_EASY_CHECK_OUT | Solde |
| 65 | EDITION_EASY_CHECK_OUT | Edition |
| 69 | EXTRAIT_COMPTE | Extrait |
| 70 | EXTRAIT_NOM | Extrait |
| 71 | EXTRAIT_DATE | Extrait |
| 72 | EXTRAIT_CUM | Extrait |
| 73 | EXTRAIT_IMP | Extrait |
| 76 | EXTRAIT_SERVICE | Extrait |
| 84 | CARACT_INTERDIT | Utilitaire |
| 97 | Saisie_facture_tva | Factures |
| - | Saisie_facture_tva V3 | Factures |
| 111 | GARANTIE | Garantie |
| 121 | Gestion_Caisse_142 | Caisse |
| 149 | CALC_STOCK_PRODUIT | Stock |
| 152 | RECUP_CLASSE_MOP | MOP |
| 178 | GET_PRINTER | Impression |
| 180 | SET_LIST_NUMBER | Impression |
| 181 | RAZ_PRINTER | Impression |
| 185 | CHAINED_LIST_DEFAULT | Liste |
| 192 | SOLDE_COMPTE | Solde |
| 208 | OPEN_PHONE_LINE | Telephone |
| 210 | CLOSE_PHONE_LINE | Telephone |
| 229 | PRINT_TICKET | Impression |
| 243 | DEVERSEMENT | Caisse |
| - | PRINT_TICKET *SAV* | Impression |
| - | SOLDE_COMPTE_SAV | Solde |

### Niveaux de Progression Skill

| Niveau | Description | Statut |
|--------|-------------|--------|
| 1 | Programmes Browse simples | VALIDE |
| 2 | CallTask et parametres | VALIDE |
| 3 | Expressions IF/CASE complexes | VALIDE |
| 4 | Editions/exports | PARTIEL |

### Infrastructure Git Sources PMS

Architecture de synchronisation des sources Magic PMS :

```
                    ┌─────────────────────────────────────────────────────┐
                    │     S:\SOURCES_XPA\PMS (BARE REPO - ORIGIN)         │
                    │     Partage réseau: //lvissvinstall/dev-01$         │
                    │     ══════════════════════════════════════          │
                    │     SOURCE DE VÉRITÉ pour les sources Magic         │
                    │     Tous les devs poussent ici                      │
                    └─────────────────────────────────────────────────────┘
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            │                             │                             │
            ▼                             ▼                             ▼
┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐
│ C:\Migration\XPA\PMS  │   │ D:\Data\Migration\    │   │      GitHub           │
│                       │   │    XPA\PMS            │   │ thonyAGP/PMS-Magic-   │
│ POSTE DEV PRINCIPAL   │   │                       │   │      Sources          │
│ ═══════════════════   │   │ ANALYSE & MIGRATION   │   │ ═══════════════════   │
│ - Développement Magic │   │ ═══════════════════   │   │ - Backup cloud        │
│ - Push vers S:        │   │ - Lecture seule Magic │   │ - Historique complet  │
│ - Modifs .opt locales │   │ - Docs MECANO/migration│  │ - Accessible externe  │
│                       │   │ - Sync depuis S: + GH │   │                       │
│ remote: origin → S:   │   │ remote: origin → S:   │   │                       │
│                       │   │ remote: github → GH   │   │                       │
└───────────────────────┘   └───────────────────────┘   └───────────────────────┘
```

| Emplacement | Role | Remote(s) | Usage |
|-------------|------|-----------|-------|
| **S:\SOURCES_XPA\PMS** | Bare repo (serveur) | - | Source de vérité, tous les devs y poussent |
| **C:\Migration\XPA\PMS** | Clone dev | origin → S: | Développement Magic, modifications .opt |
| **D:\Data\Migration\XPA\PMS** | Clone analyse | origin → S:, github → GH | Analyse, migration, documentation |
| **GitHub** | Backup cloud | - | Historique, accès externe, backup |

**Commandes de synchronisation :**

```powershell
# Mettre à jour C: depuis S:
git -C 'C:\Migration\XPA\PMS' stash push -m 'WIP' --include-untracked
git -C 'C:\Migration\XPA\PMS' pull --rebase origin master
git -C 'C:\Migration\XPA\PMS' stash pop

# Mettre à jour D: depuis S: et pousser vers GitHub
git -C 'D:\Data\Migration\XPA\PMS' stash push -m 'WIP'
git -C 'D:\Data\Migration\XPA\PMS' pull --rebase origin master
git -C 'D:\Data\Migration\XPA\PMS' push github master
git -C 'D:\Data\Migration\XPA\PMS' stash pop
```

**Notes importantes :**
- Les fichiers `.opt` sont des configs locales Magic, ils diffèrent entre C: et D:
- Les conflits sur ProgramHeaders.xml/Progs.xml : toujours prendre la version origin (production)
- S: nécessite parfois `git config --global --add safe.directory` pour les accès directs

## Fonctionnalites

### Modules valides

- [x] **MECANO** (PBP) - Liste mecanographique - Valide 2025-12-22
  - Scripts SQL: `migration/mecano/sql/`
  - Doc: `openspec/mecano/MECANO_SPEC.md`

- [x] **ADH/Gestion Caisse** - API C# .NET 8 COMPLETE - Valide 2025-12-29
  - Solution: `migration/caisse/Caisse.sln`
  - 5 projets: Domain, Application, Infrastructure, Api, Shared
  - **Interface graphique complete:** 14 ecrans SPA (HTML/CSS/JS) - index corrige CA0142, ouverture-session CA0143
  - **~125 endpoints** couvrant tous les modules migres
  - **527 tests unitaires** (100% pass)
  - **Couverture:** 85.5% (9 progs vides exclus, 354 lignes desactivees ignorees)
  - Swagger: http://localhost:5287/swagger
  - Interface: http://localhost:5287/

  **Modules migres:**
  - Sessions, Devises, Articles, Details, Coffre, Parametres
  - Ventes (Gift Pass, Resort Credit, Historique, PrintTicket)
  - Zooms (8 endpoints), Members, Solde, Extrait, Garantie
  - Change (3 endpoints), Telephone (3 endpoints), EasyCheckOut, Factures
  - Identification, EzCard (3 endpoints), Depot (2 endpoints)
  - Divers (5 endpoints) - Langue, Titre, AccesInfo, IntegriteDates, SessionTimestamp
  - Utilitaires (10 endpoints) - Init, Backup, Restore, Export, Import, Purge, Maintenance, PrintTicket, LogViewer, SystemInfo
  - ChangementCompte (12 endpoints) - Menu, Separation, Fusion, Historique
  - Menus (5 endpoints) - MenuCaisse, MenuVentes, MenuChange, MenuDepot, MenuFactures

  **Ecrans SPA (flux: Main→ADH IDE 1→ADH IDE 162→ADH IDE 121):**
  | Ecran | ID Magic | Programmes ADH IDE | Description |
  |-------|----------|------------|-------------|
  | index.html | **CA0142** | ADH IDE 121 | Gestion de la caisse (ecran principal SDI) |
  | ouverture-session.html | **CA0143** | ADH IDE 294 | Ouverture session - grille comptage initial |
  | sessions.html | - | ADH IDE 77, 80, 236 | Liste sessions, Consultation, Historique |
  | zooms.html | - | ADH IDE 164-189 | Tables de reference (8 zooms) |
  | telephone.html | - | ADH IDE 202-220 | Lignes telephone (OPEN/CLOSE/STATS) |
  | change.html | - | ADH IDE 20-25 | Operations de change devises |
  | ventes.html | - | ADH IDE 229-250 | Gift Pass, Resort Credit, Historique |
  | extrait.html | - | ADH IDE 69-76 | Extrait de compte avec filtres |
  | garanties.html | - | ADH IDE 111-114 | Depots et cautions |
  | easycheckout.html | - | ADH IDE 53-67 | Workflow Easy Check-Out |
  | factures.html | - | ADH IDE 54, 89-97 | Gestion facturation TVA |
  | changement-compte.html | - | ADH IDE 27-37 | Separation/Fusion comptes |

  **Note flux ecrans:** ADH IDE 162 ("Menu caisse GM") est un menu intermediaire sans form visible.
  L'ecran principal visible est ADH IDE 121 (CA0142) avec WindowType=2 (SDI).

- [x] **ADH/Ventes - ADH IDE 237 Solde Gift Pass** - Migre 2025-12-27
  - Endpoint: `GET /api/ventes/solde-giftpass/{societe}/{compte}/{filiation}`
  - Table: `ccpartyp` (cc_total_par_type)
  - Query CQRS: GetSoldeGiftPassQuery
  - 8 tests unitaires (validator)

- [x] **ADH/Ventes - ADH IDE 250 Solde Resort Credit** - Migre 2025-12-27
  - Endpoint: `GET /api/ventes/solde-resortcredit/{societe}/{compte}/{filiation}/{service}`
  - Table: `resort_credit`
  - Query CQRS: GetSoldeResortCreditQuery
  - Logique: IF(attribue > utilise, attribue - utilise, 0)
  - **Dashboard HTML visuel** a la racine (/)
  - 15 tests unitaires (validator)

- [x] **ADH/Zooms - Phase 1** - Migre 2025-12-27
  - 8 endpoints: `/api/zooms/{type}`
  - 7 tables REF: moyens-reglement, tables, devises, garanties, depots-objets, depots-devises, pays, types-taux-change
  - Entites: MoyenReglement, TableReference, DeviseZoom, DepotObjet, DepotDevise, Pays, TypeTauxChange
  - Ecran interactif: `/zooms.html`
  - Fix decimal->double pour colonnes SQL float

- [x] **ADH/Members - ADH IDE 160 GetCMP** - Migre 2025-12-27
  - Endpoint: `GET /api/members/club-med-pass/{societe}/{compte}/{filiation}`
  - Table: `ezcard` (ez_card)
  - Query CQRS: GetClubMedPassQuery
  - Retourne: CardCode si status != 'O' (Opposition)
  - 14 tests unitaires (validator)

- [x] **ADH/Solde - ADH IDE 192 SOLDE_COMPTE** - Migre 2025-12-28
  - Endpoint: `GET /api/solde/{societe}/{compte}/{filiation}`
  - Tables: operations (operations_dat), ccpartyp (cc_total_par_type)
  - Query CQRS: GetSoldeCompteQuery
  - Calcul: SUM(Credit) - SUM(Debit) par service
  - 7 tests unitaires

- [x] **ADH/Ventes - ADH IDE 238 Historique** - Migre 2025-12-28
  - Endpoint: `GET /api/ventes/historique/{societe}/{compte}/{filiation}`
  - Table: ccventes (cc_ventes)
  - Query CQRS: GetHistoVentesQuery
  - Liste toutes les ventes avec tri par date
  - 7 tests unitaires

- [x] **ADH/Extrait - ADH IDE 69 EXTRAIT_COMPTE** - Migre 2025-12-28
  - Endpoint: `GET /api/extrait/{societe}/{compte}/{filiation}`
  - Tables: operations (operations_dat), services (cafil048_dat)
  - Query CQRS: GetExtraitCompteQuery
  - Mouvements tries par date avec cumul progressif
  - 7 tests unitaires

- [x] **ADH/Garantie - ADH IDE 111 GARANTIE** - Migre 2025-12-28
  - Endpoint: `GET /api/garantie/{societe}/{compte}/{filiation}`
  - Tables: depot_garantie, cafil069_dat (types garantie)
  - Query CQRS: GetGarantieCompteQuery
  - Depots actifs avec jointure sur types garantie
  - 7 tests unitaires

- [x] **ADH/Change - Phase 7** - Migre 2025-12-28
  - 3 endpoints: devise-locale, taux, calculer
  - Table: taux_change (cafil028_dat)
  - Entite: TauxChange avec logique metier
  - Queries: GetDeviseLocaleQuery, GetTauxChangeQuery, CalculerEquivalentQuery
  - Logique: Achat UNI=TauxAchat, Achat BI=TauxVente, Vente=divise par TauxVente
  - 47 tests unitaires
  - **244 tests au total**

- [x] **ADH/Telephone - Phase 8** - Migre 2025-12-28
  - 2 endpoints: get lignes, gerer (open/close)
  - Table: pi_dat (lignes_telephone)
  - Entite: LigneTelephone avec methodes Ouvrir/Fermer
  - Query: GetLigneTelephoneQuery
  - Command: GererLigneTelephoneCommand (OPEN/CLOSE)
  - Etats: O=Ouvert, F=Ferme, B=Bloque
  - 28 tests unitaires

- [x] **ADH/EasyCheckOut - Phase 9** - Migre 2025-12-28
  - 3 endpoints: solde, edition, extrait
  - Queries: EditionEasyCheckOutQuery, ExtraitEasyCheckOutQuery
  - Command: SoldeEasyCheckOutCommand
  - 8 tests unitaires

- [x] **ADH/Factures - Phase 10** - Migre 2025-12-28
  - 2 endpoints: checkout, creer
  - Query: GetFacturesCheckOutQuery
  - Command: CreerFactureCommand
  - Calcul TVA automatique
  - 29 tests unitaires

- [x] **ADH/Identification - Phase 11** - Migre 2025-12-28
  - 2 endpoints: verifier, session
  - Queries: VerifierOperateurQuery, VerifierSessionCaisseQuery
  - Verification droits operateur et session caisse
  - 17 tests unitaires
  - **327 tests au total**

### Modules en cours

- [ ] **ADH** - Tests d'integration et documentation

### Modules explores

- [x] **PBG** - Planification/Batch (394 progs, 23 dossiers)
  - Traitement arrivees (71 progs), Affectation logements (19 progs)
  - Interface Quadriga, Gestion personnel
  - 1 table Memory locale, utilise REF.ecf

- [x] **PVE** - Point de Vente/POS (448 progs, 26 dossiers)
  - Mobile POS (31 progs), TPE (9 progs), Stocks (14 progs)
  - Interface Booker (27 progs)
  - Utilise REF.ecf + ADH.ecf (fonctions caisse)

## Taches

### 🎯 PRIORITE N°1 : Consolidation Infrastructure Outils

**Objectif** : Avoir un ecosysteme d'outils fiable et complet pour :
- Lecture/parsing XML Magic
- Migration vers langages modernes (TS, C#, Python)
- Documentation automatique
- Resolution de bugs
- Amelioration continue

**Inventaire des outils** (2026-01-27 - Post AUDIT PDCA Phase 2) :

| Categorie | Outils | Etat | Cible | Score |
|-----------|--------|------|-------|-------|
| MCP Server | **93 outils** | **211%** | 44 | **A+** |
| Agents specialises | 5 agents | 100% | 5 | **A** |
| Scripts PowerShell | **130 scripts** | 52% doc | 100% | **B** |
| Parser TypeScript | 3 generateurs | **100%** | 100% | **A** |
| Fonctions Magic | **200/200** | **100%** | 200 | **A** |
| Tests MCP | **88/88** | **100%** | 80% | **A+** |
| Tests spec-generator | **25/25** | **100%** | 25 | **A** |
| Patterns KB | **16 patterns** | **80%** | 20+ | **B+** |
| Linking specs-patterns | **235/323** | **73%** | 80% | **B** |
| Specs V3.5 | **322/323** | **100%** | 100% | **A** |
| Migration C# | **79 progs** | **22.6%** | 350 | **C** |
| Orphelins ADH | **88** | N/A | - | Archives |

### Nouveaux outils MCP (2026-01-26) - Regression Detection

| Outil | Description | Statut |
|-------|-------------|--------|
| `magic_detect_regression` | Compare etat actuel KB vs spec sauvegardee. Detecte expressions, tables, access mode changes | **NOUVEAU** |
| `magic_spec_drift_report` | Rapport drift pour tous les specs d'un projet (IN_SYNC, MINOR_DRIFT, MAJOR_DRIFT) | **NOUVEAU** |

### Scripts Migration (2026-01-26)

| Script | Description | Statut |
|--------|-------------|--------|
| `Generate-MigrationBlueprint.ps1` | Genere squelette C# (Entities, Handlers, DTOs) depuis spec | **NOUVEAU** |
| `Generate-TestsFromSpec.ps1` | Genere tests xUnit/Vitest depuis spec (scenarios, validation) | **NOUVEAU** |

### Nouveaux outils MCP (2026-01-24)

| Outil | Description | Statut |
|-------|-------------|--------|
| `magic_get_forms` | Affiche les Forms (UI screens) d'une tache avec WindowType, dimensions | **NOUVEAU** |
| `magic_get_form_controls` | **Affiche les Controls (boutons, champs, tables) dans une Form** | **NOUVEAU** |
| `magic_kb_constant_conditions` | Detecte conditions constantes (IF(0,...)) | **NOUVEAU** |
| `magic_kb_constant_stats` | Statistiques conditions constantes | **NOUVEAU** |
| `magic_kb_dynamic_calls` | Detecte appels ProgIdx() dynamiques | **NOUVEAU** |
| `magic_migration_inventory` | Inventaire programmes avec scores complexite | **NOUVEAU** |
| `magic_migration_dependencies` | Appels cross-projet (entrants/sortants) | **NOUVEAU** |
| `magic_migration_stats` | Statistiques projet (tables, forms, effort) | **NOUVEAU** |
| `magic_migration_projects` | Liste projets KB avec stats | **NOUVEAU** |

### Outils MCP Synergie (2026-01-25) - NOUVEAU

**Tier 1: Feedback Loop** (ticket ↔ patterns)

| Outil | Description | Statut |
|-------|-------------|--------|
| `magic_pattern_search` | Recherche FTS5 patterns par mots-cles | **NOUVEAU** |
| `magic_pattern_stats` | Statistiques usage patterns (top used, coverage) | **NOUVEAU** |
| `magic_pattern_link` | Liens ticket-pattern (qui a utilise quoi) | **NOUVEAU** |
| `magic_pattern_feedback` | Score sante feedback loop (0-100) | **NOUVEAU** |

**Tier 2: Pattern Sync** (Markdown → KB)

| Outil MCP | Description | Statut |
|-----------|-------------|--------|
| `magic_pattern_sync` | Synchronise patterns Markdown vers KB | **NOUVEAU 2026-01-26** |
| `magic_pattern_status` | Vérifie statut synchronisation fichiers vs KB | **NOUVEAU 2026-01-26** |

| Commande KbIndexRunner | Description | Statut |
|------------------------|-------------|--------|
| `sync-patterns` | Import `.openspec/patterns/*.md` vers resolution_patterns | **NOUVEAU** |
| `search-patterns <query>` | Recherche FTS5 dans patterns KB | **NOUVEAU** |

**Tier 3: Variable Lineage** (tracage valeurs)

| Outil | Description | Statut |
|-------|-------------|--------|
| `magic_variable_lineage` | Trace modifications d'une variable dans un programme | **NOUVEAU** |
| `magic_variable_sources` | Trouve origines possibles (colonnes, expressions, params) | **NOUVEAU** |

| Commande KbIndexRunner | Description | Statut |
|------------------------|-------------|--------|
| `variable-lineage <project> <ide> <var>` | Test lineage depuis CLI | **NOUVEAU** |

**Tier 4: ECF Shared Components Registry** (cross-project dependencies)

| Outil | Description | Statut |
|-------|-------------|--------|
| `magic_ecf_list` | Liste ECF files avec statistiques | **NOUVEAU** |
| `magic_ecf_programs` | Liste programmes dans un ECF | **NOUVEAU** |
| `magic_ecf_usedby` | Trouve qui utilise un programme | **NOUVEAU** |
| `magic_ecf_dependencies` | Dépendances cross-projet | **NOUVEAU** |

| Commande KbIndexRunner | Description | Statut |
|------------------------|-------------|--------|
| `populate-ecf` | Peuple le registre ECF (762 composants) | **NOUVEAU** |

**Tier 5: Change Impact Analysis** ("Si je modifie X, qu'est-ce qui casse?")

| Outil | Description | Statut |
|-------|-------------|--------|
| `magic_impact_program` | Analyse impact complet d'un programme (callers, callees, tables, ECF) | **NOUVEAU** |
| `magic_impact_table` | Analyse impact modification d'une table | **NOUVEAU** |
| `magic_impact_expression` | Trouve programmes utilisant un pattern d'expression | **NOUVEAU** |
| `magic_impact_crossproject` | Analyse dépendances cross-projet | **NOUVEAU** |

| Commande KbIndexRunner | Description | Statut |
|------------------------|-------------|--------|
| `analyze-impact <project> <ide>` | Analyse d'impact rapide depuis CLI | **NOUVEAU** |

### Schema Knowledge Base v5 (2026-01-25) - NOUVEAU

```sql
-- Table Tier 5: Change Impact Analysis
CREATE TABLE IF NOT EXISTS change_impacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_project TEXT NOT NULL,
    source_program_id INTEGER NOT NULL,
    source_element_type TEXT NOT NULL,  -- 'program', 'expression', 'variable', 'table'
    source_element_id TEXT,
    affected_project TEXT NOT NULL,
    affected_program_id INTEGER NOT NULL,
    impact_type TEXT NOT NULL,          -- 'calls', 'called_by', 'reads', 'writes', 'uses_table', 'uses_ecf'
    severity TEXT NOT NULL DEFAULT 'medium',  -- 'critical', 'high', 'medium', 'low'
    UNIQUE(source_project, source_program_id, source_element_type, source_element_id, affected_project, affected_program_id, impact_type)
);
```

### Schema Knowledge Base v4 (2026-01-25)

```sql
-- Table Tier 4: ECF Shared Components
CREATE TABLE IF NOT EXISTS shared_components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ecf_name TEXT NOT NULL,           -- "ADH.ecf", "REF.ecf", "UTILS.ecf"
    program_ide_position INTEGER NOT NULL,
    program_public_name TEXT,
    program_internal_name TEXT,
    owner_project TEXT NOT NULL,      -- Project that owns this program
    used_by_projects TEXT,            -- JSON array ["PBP", "PVE"]
    component_group TEXT,             -- "Sessions_Reprises", "Tables", etc.
    UNIQUE(ecf_name, program_ide_position)
);
```

**ECF Registry Stats:**
| ECF | Programs | Owner | Used By |
|-----|----------|-------|---------|
| REF.ecf | 734 | REF | ADH, PBP, PVE, PBG |
| ADH.ecf | 27 | ADH | PBP, PVE |
| UTILS.ecf | 1 | UTILS | ADH |

### Schema Knowledge Base v3 (2026-01-25)

```sql
-- Table Tier 3: Variable Lineage
CREATE TABLE IF NOT EXISTS variable_modifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project TEXT NOT NULL,
    program_id INTEGER NOT NULL,
    task_isn2 INTEGER NOT NULL,
    line_number INTEGER NOT NULL,
    variable_name TEXT NOT NULL,
    operation TEXT,           -- Update, VarSet, Action, etc.
    source_type TEXT,         -- expression, table_column, parameter, constant
    source_expression_id INTEGER,
    source_table_id INTEGER,
    source_column_name TEXT,
    source_description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(project, program_id, task_isn2, line_number, variable_name)
);
```

### Offsets dynamiques (2026-01-24) - NOUVEAU

**Calcul automatique du Main offset au chargement des projets.**

| Projet | Offset Calcule | Offset Hardcode | Status |
|--------|----------------|-----------------|--------|
| ADH | 118 | 117 | Delta +1 (Remark?) |
| VIL | 52 | 52 | MATCH |
| PBP | 88 | 88 | MATCH |
| PVE | 143 | 143 | Dynamique |
| PBG | 91 | 91 | Dynamique |
| REF | 107 | 107 | Dynamique |

**Formule:** Main_VG = nombre de Columns dans Task ISN_2=1 du premier programme

### Skill ticket-analyze (2026-01-24) - NOUVEAU

**Orchestrateur workflow analyse tickets Magic** - Force les 6 phases du protocole.

| Fichier | Role |
|---------|------|
| `skills/ticket-analyze/SKILL.md` | Skill principal |
| `skills/ticket-analyze/templates/questions.json` | Questions standardisees (6 categories) |
| `skills/ticket-analyze/templates/patterns.json` | Index 11 patterns KB |
| `.openspec/patterns/*.md` | 5 patterns documentes |
| `.claude/hooks/validate-ticket-analysis.ps1` | Hook validation v2.0 |
| `.claude/protocols/ticket-analysis.md` | Protocole mis a jour |

**Phases orchestrees** :
1. Contexte Jira (5 min)
2. Localisation programmes (10 min)
3. Tracage flux + diagramme ASCII (15 min)
4. Analyse expressions {N,Y} (20 min)
5. Root Cause ou piste documentee (10 min)
6. Solution Avant/Apres (5 min)

**Patterns KB capitalises** :
- `date-format-inversion.md` (CMDS-174321)
- `add-filter-parameter.md` (PMS-1373)
- `picture-format-mismatch.md` (CMDS-176521)
- `table-link-missing.md` (PMS-1451)
- `ski-rental-duration-calc.md` (PMS-1446)

**Commandes** :
```
/ticket-analyze PMS-1234   # Analyse orchestree
/ticket-search "symptome"  # Recherche patterns
/ticket-learn PMS-1234     # Capitaliser resolution
```

### Pipeline Hybride v2.0 (2026-01-29) - MIS A JOUR

**Architecture hybride** : Pipeline PS1 (collecte donnees) + Claude (analyse/redaction).

| Script | Role | Inputs | Outputs |
|--------|------|--------|---------|
| `Run-TicketPipeline.ps1` | Orchestrateur | TicketKey, -SkipJira | 7 fichiers JSON |
| `auto-extract-context.ps1` | Phase 1 (v2.0) | Jira/Index/Fichiers | context.json (keywords, attachments) |
| `auto-find-programs.ps1` | Phase 2 (v2.0) | Programmes | programs.json (callers/callees) |
| `auto-trace-flow.ps1` | Phase 3 | Programmes | flow.json + diagram.txt |
| `auto-decode-expressions.ps1` | Phase 4 | Expressions | expressions.json (decodees) |
| `auto-match-patterns.ps1` | Phase 5 | Symptomes | patterns.json (scores) |
| `auto-consolidate.ps1` | Consolidation | Tous JSON | pipeline-data.json (< 30KB) |
| `TEMPLATE-ANALYSIS.md` | Template | - | Structure 9 sections |

**Usage** :
```powershell
# Pipeline complet + consolidation
.\tools\ticket-pipeline\Run-TicketPipeline.ps1 -TicketKey "PMS-1234" -SkipJira
.\tools\ticket-pipeline\auto-consolidate.ps1 -TicketDir ".openspec\tickets\PMS-1234"
```

**Caracteristiques v2.0** :
- Phase 1: 3 sources prioritaires (Jira API → Index local → Fichiers)
- Phase 2: Callers/callees via KB SQLite (KbIndexRunner CLI)
- Phase 5: Scoring patterns avec PSCustomObject (fix $Matches PS variable)
- Toutes phases: UTF-8 sans BOM (fix [System.IO.File]::WriteAllText)
- Consolidation < 30KB pour consommation Claude
- Template 9 sections: Contexte, Localisation, Tables, Flux, Expressions, Diagnostic, Checklist+Impact, Commits, Screenshots
- **Teste**: PMS-1427 6/6 (55 progs), PMS-1419 6/6 (4 progs)

---

## 📋 PLAN VERS 100% - Roadmap detaillee

### 1. MCP Server (100% - COMPLET)

| Tache | Priorite | Effort | Statut |
|-------|----------|--------|--------|
| MCP Inspector configure | P0 | 5min | ✅ FAIT |
| Script start-mcp-inspector.ps1 | P0 | 5min | ✅ FAIT |
| Tests unitaires C# (27 tests) | P1 | 2h | ✅ FAIT |
| Hooks validation IDE Magic | P1 | 1h | ✅ FAIT |
| Documentation API MCP | P2 | 1h | A faire |

**Tests IDE Magic Compliance** : 27/27 tests passent (100%)
- Tests outils MCP (magic_get_position, magic_get_tree, etc.)
- Validation patterns interdits (Prg_XXX, {0,3}, ISN_2, etc.)
- Suite: `tools/MagicMcp.Tests/IdeMagicComplianceTests.cs`

**Workflow dev MCP** (sans redemarrer Claude Code) :
```powershell
# 1. Lancer MCP Inspector
.\tools\start-mcp-inspector.ps1

# 2. Modifier le code MagicMcp
# 3. Rebuild
.\tools\start-mcp-inspector.ps1 -Build

# 4. Tester dans le navigateur (http://localhost:6274)
```

### 2. Agents specialises (100% - COMPLET)

| Agent | Fichier | Role | Statut |
|-------|---------|------|--------|
| magic-router | `.claude/agents/magic-router.md` | Routage intelligent | ✅ |
| magic-analyzer | `.claude/agents/magic-analyzer.md` | Analyse programmes | ✅ |
| magic-debugger | `.claude/agents/magic-debugger.md` | Resolution bugs | ✅ |
| magic-migrator | `.claude/agents/magic-migrator.md` | Generation code | ✅ |
| magic-documenter | `.claude/agents/magic-documenter.md` | Documentation | ✅ |

### 3. Parser TypeScript (100% - COMPLET)

| Composant | Actuel | Cible | Actions |
|-----------|--------|-------|---------|
| Lexer/Parser | 90% | 100% | Gerer cas limites |
| Fonctions Magic | **200/200** | 200/200 | **COMPLET** |
| Generateur TS | **100%** | 100% | ✅ 200 fonctions mappees |
| Generateur C# | **100%** | 100% | ✅ 200 fonctions mappees |
| Generateur Python | **100%** | 100% | ✅ 200 fonctions mappees |
| Tests unitaires | 30% | 80% | Ajouter 50+ tests |

**Fonctions mappees par batch** :
- [x] **Batch 0** : 50 fonctions (TOP 50 frequence) - FAIT 2026-01-11
- [x] **Batch 1** : 30 fonctions (Dates, Strings, Math) - FAIT 2026-01-11
- [x] **Batch 2** : 30 fonctions (DB, I/O, Flow, UI) - FAIT 2026-01-12
- [x] **Batch 3** : 30 fonctions (XML, Vector, Buffer) - FAIT 2026-01-12
- [x] **Batch 4** : 30 fonctions (COM, DLL, HTTP, Context) - FAIT 2026-01-12
- [x] **Batch 5** : 30 fonctions (Window, Menu, Control, Range) - FAIT 2026-01-12

### 4. Communication IDE (REGLE ABSOLUE)

| Element | Format INTERDIT | Format OBLIGATOIRE |
|---------|-----------------|-------------------|
| Programme | Prg_69, ISN 4523 | ADH IDE 69 - EXTRAIT_COMPTE |
| Variable | {0,3}, FieldID 25 | Variable D |
| Tache | Task ISN_2=5 | Tache 69.3 |
| Ligne | LogicLine id=15 | Tache 69.3 ligne 21 |
| Table | DataObject ISN=40 | Table n°40 - operations |
| Expression | Expression ISN=30 | Expression 30 |

**Outils MCP a utiliser systematiquement** :
- `magic_get_position` → Convertir en format IDE
- `magic_get_line` → DataView + Logic formatee

---

**Sous-taches prioritaires** :
- [x] **P1.1** Architecture agents Magic Router (fait: 2026-01-10)
- [x] **P1.2** Creer 5 agents specialises (fait: 2026-01-10)
- [x] **P1.3** Enrichir CLAUDE.md avec regles IDE (fait: 2026-01-10)
- [ ] **P1.4** Reconnecter MCP (redemarrer session)
- [x] **P1.5** Completer parser TypeScript (fait: 2026-01-12) - 200 fonctions dans 4 fichiers
- [ ] **P1.6** Tests automatises outils MCP

### A traiter
- [ ] Tests d'integration sur CSK0912
- [ ] Documentation utilisateur API

### En cours
- [x] **P1.1** Reparer connexion MCP magic-interpreter (en cours: 2026-01-10)

### Terminees
- [x] **AUDIT PDCA Phase 1** (terminee: 2026-01-27) - Archive parsers v1-v4, README scripts (66), +4 patterns KB (16 total), Tests MCP 88/88. Scorecard global: MCP A+, Patterns B+, Migration C
- [x] **Synergie Ecosysteme Tiers 1-5** (terminee: 2026-01-25) - Feedback loop, Pattern sync FTS5, Variable lineage, ECF Registry, Change Impact Analysis. 14 outils MCP, 5 commandes KbIndexRunner, Schema v5. 762 composants partagés
- [x] **Amelioration Systeme Analyse Tickets + Migration Specs** (terminee: 2026-01-24) - Schema v2 (3 tables), ExpressionCacheService, auto-capitalize, track-metrics, MigrationExtractor, Generate-MigrationSpec
- [x] **Form Controls + Discovery + Validation** (terminee: 2026-01-24) - magic_get_form_controls outil MCP, ProjectDiscoveryService, KbIndexRunner validate mode
- [x] **Forms MCP + Offsets dynamiques** (terminee: 2026-01-24) - magic_get_forms outil MCP, calcul automatique Main offset, MagicTaskForm model
- [x] **Skill ticket-analyze v2.0** (terminee: 2026-01-24) - Orchestrateur 6 phases, 5 patterns KB, hook validation, templates questions
- [x] **Audit Workflow Analyse Tickets** (terminee: 2026-01-24) - 3 outils MCP (constant conditions, dynamic calls), detection ECF dynamique, hook enrichi
- [x] **Parser TypeScript COMPLET** (terminee: 2026-01-12) - 200 fonctions dans 4 fichiers (registry, TS, C#, Python)
- [x] **Analyse Main/ADH IDE 162 + 6 ecrans** (terminee: 2025-12-31) - Tracage flux CallTask, 3 gaps API combles, 6 ecrans SPA crees
- [x] **Phase 11: Identification (2 endpoints)** (terminee: 2025-12-28) - Login + Session check, 327 tests total
- [x] **Phase 12: EzCard (3 endpoints)** (terminee: 2025-12-28) - Cards lookup, deactivation, character validation
- [x] **Phase 12: Divers (5 endpoints)** (terminee: 2025-12-28) - Langue, Titre, AccesInfo, IntegriteDates, SessionTimestamp
- [x] **Phase 12: Depot (2 endpoints)** (terminee: 2025-12-28) - Deposit extract, withdrawal
- [x] **Interface Graphique Complete** (terminee: 2025-12-28) - 10 ecrans SPA (HTML/CSS/JS), 458 tests total
- [x] **Phase 10: Factures (2 endpoints)** (terminee: 2025-12-28) - Checkout + Creation, 310 tests total
- [x] **Phase 9: EasyCheckOut (3 endpoints)** (terminee: 2025-12-28) - Solde + Edition + Extrait, 281 tests total
- [x] **Phase 8: Telephone (2 endpoints)** (terminee: 2025-12-28) - Query + Command, 272 tests total
- [x] **Phase 7: Change (3 endpoints)** (terminee: 2025-12-28) - Calcul equivalent devise, 244 tests total
- [x] **Phase 3-6: Solde, Ventes, Extrait, Garantie** (terminee: 2025-12-28) - 4 queries, 197 tests total
- [x] **Phase 2: Members (ADH IDE 160 GetCMP)** (terminee: 2025-12-27) - Endpoint members/club-med-pass, 145 tests
- [x] **Phase 1: Zooms (8 endpoints)** (terminee: 2025-12-27) - 7 tables REF, ecran interactif, fix decimal/double
- [x] **Migration ADH IDE 250 Solde Resort Credit** (terminee: 2025-12-27) - Dashboard HTML, 131 tests
- [x] **Migration ADH IDE 237 Solde Gift Pass** (terminee: 2025-12-27) - Premier programme Ventes migre, 10 tables, 116 tests
- [x] **Flux coffre ouverture/fermeture** (terminee: 2025-12-27) - 4 details ouverture (I,C,K,L), validation ecart, 108 tests
- [x] **Logique metier ecarts** (terminee: 2025-12-27) - Value Objects, IEcartCalculator, validation fermeture
- [x] **API Caisse complete** (terminee: 2025-12-27) - 24 endpoints, 9 tables, Clean Architecture
- [x] Analyse ADH IDE 131 Fermeture caisse (terminee: 2025-12-26) - 17 params, 22 sous-taches, 10 tables REF, 21 progs externes
- [x] Exploration PBG et PVE (terminee: 2025-12-24) - 394+448 progs, roles identifies
- [x] Analyse ADH IDE 122 Ouverture caisse (terminee: 2025-12-24) - 15 params, 9 sous-taches, 3 tables REF
- [x] Amelioration skill tables (terminee: 2025-12-24) - Colonnes detaillees, codes StoredAs
- [x] Migration MECANO (terminee: 2025-12-22) - Scripts SQL valides sur CSK0912
- [x] Identification composants ADH (terminee: 2025-12-24) - 30 programmes partages identifies
- [x] Analyse Gestion Caisse (terminee: 2025-12-24) - 41 progs, flux principal identifie
- [x] Analyse tables REF ADH IDE 121 (terminee: 2025-12-24) - 6 tables identifiees et documentees
- [x] Creation structure OpenSpec (terminee: 2025-12-24)

## Plans

### Plan actuel: Migration ADH Complete (2025-12-28)

**Progression: 11 modules migres, 327 tests, 52 endpoints**

| Phase | Module | Endpoints | Tests | Statut |
|-------|--------|-----------|-------|--------|
| 1 | Zooms | 8 | 14 | FAIT |
| 2 | Members | 1 | 14 | FAIT |
| 3 | Solde | 1 | 7 | FAIT |
| 4 | Ventes | 3 | 22 | FAIT |
| 5 | Extrait | 1 | 7 | FAIT |
| 6 | Garantie | 1 | 7 | FAIT |
| 7 | Change | 3 | 47 | FAIT |
| 8 | Telephone | 2 | 28 | FAIT |
| 9 | EasyCheckOut | 3 | 8 | FAIT |
| 10 | Factures | 2 | 29 | FAIT |
| 11 | Identification | 2 | 17 | FAIT |
| - | Caisse (base) | 24 | 126 | FAIT |

**Prochaines etapes:**
1. Tests d'integration avec donnees reelles
2. Modules secondaires (EzCard, Depot, Divers)
3. Documentation utilisateur

### Historique des plans

#### Plan API Caisse (2025-12-27) - TERMINE
- Creation solution Clean Architecture .NET 8
- Mapping 9 tables EF Core
- Implementation 23 endpoints CQRS
- Tests sur base CSK0912

#### Plan MECANO (2025-12-22) - TERMINE
- Analyse flux programmes PBP 243-250
- Creation vues SQL
- Validation sur base CSK0912

## Decisions

| Date | Decision | Contexte | Alternatives rejetees |
|------|----------|----------|----------------------|
| 2026-01-29 | **Push master = deploy jira.lb2i auto** | Un simple `git push origin master` suffit pour deployer automatiquement sur jira.lb2i.com (specs + tickets). Pas besoin d'executer Deploy-OpenSpec.ps1 manuellement. | Deploy manuel via UNC ou script |
| 2026-01-28 | **KbIndexRunner CLI > SQLite DLL** | PowerShell ne resout pas les dependances natives de Microsoft.Data.Sqlite. Erreur "Impossible de charger types requis". CLI fiable a 100%. Voir `tools/spec-pipeline-v60/LESSONS-LEARNED.md` | Charger SQLite DLL directement (ECHEC REPETE) |
| 2026-01-05 | **Facteurs DLU calibres X=0.65, Y=2.0** | Validation visuelle CA0142: 939×178 DLU → 610×356 px. Positions boutons fideles | X=0.5/Y=1.0 (trop petit), X=0.53/Y=1.0 (hauteur insuffisante) |
| 2026-01-04 | **Correction tracage flux** | ADH IDE 162 n'est PAS l'ecran visible - c'est un menu intermediaire (CallTask vers ADH IDE 121). Ecran visible = CA0142 (ADH IDE 121) avec WindowType=2 (SDI) | Considerer ADH IDE 162 comme ecran principal (ERREUR) |
| 2026-01-04 | Identifier ecrans par ID public | Format CA0XXX visible dans titre ecran correspond au Public Name dans ProgramHeaders.xml | Identifier par nom programme interne |
| 2025-12-27 | Ecarts via Domain Service | Logique metier dans IEcartCalculator, testable | Calcul inline dans handler |
| 2025-12-27 | Seuil alerte configurable | Parametre SeuilAlerte avec ForceClosureOnEcart | Seuil fixe en config |
| 2025-12-27 | Clean Architecture + CQRS | Separation claire, testabilite | N-tier classique |
| 2025-12-27 | EF Core 8 + Minimal API | Stack moderne .NET 8 | Dapper seul, Controllers |
| 2025-12-22 | SQL Server comme cible MECANO | Base existante CSK0912 | PostgreSQL (pas de base dispo) |
| 2025-12-24 | Priorite ADH/Gestion Caisse | Module le plus critique (41 progs) | Ventes, Telephone |
| 2026-01-07 | Interface gestion tickets Jira | CLI interactif au demarrage + KB SQLite pour capitalisation | Interface web (trop complexe), fichiers MD seuls (pas de recherche) |

## Gestion Tickets Jira

### Structure

```
.openspec/tickets/
├── index.json              # Cache tickets actifs (sync Jira)
├── patterns.sqlite         # Knowledge Base (resolutions capitalisees)
└── {ISSUE-KEY}/
    ├── analysis.md         # Analyse technique
    ├── notes.md            # Notes de travail
    ├── resolution.md       # Solution finale
    └── attachments/        # Pieces jointes
```

### Commandes disponibles

| Commande | Description |
|----------|-------------|
| `/ticket` | Menu principal - liste tickets actifs |
| `/ticket-new {KEY}` | Initialise analyse d'un nouveau ticket |
| `/ticket-learn {KEY}` | Capitalise resolution dans KB |
| `/ticket-search {query}` | Recherche patterns similaires |

### Projets Jira suivis

| Projet | Description | Prefixe |
|--------|-------------|---------|
| CMDS | Support PMS (incidents, questions) | CMDS-XXXXXX |
| PMS | Bugfix/Release (corrections, evolutions) | PMS-XXXXX |

### Workflow

1. **Demarrage session** → Menu CLI automatique (hook SessionStart)
2. **Selection ticket** ou `/ticket-new CMDS-XXXXX`
3. **Analyse** avec outils MCP Magic
4. **Resolution** documentee dans `resolution.md`
5. **Capitalisation** via `/ticket-learn` → KB SQLite

### Tickets actifs (sync Jira 2026-01-25)

| Ticket | Statut Jira | Résolu | Pattern KB |
|--------|-------------|--------|------------|
| PMS-1373 | **Recette OK** | 2026-01-13 | add-filter-parameter |
| PMS-1337 | **Recette OK** | 2026-01-22 | - |
| PMS-1404 | **Recette OK** | 2026-01-19 | - |
| PMS-1407 | **Recette OK** | 2026-01-19 | local-config-regression |
| PMS-1414 | **Recette OK** | 2026-01-20 | - |
| PMS-1437 | **Recette OK** | 2026-01-12 | modedayinc-date-display |
| PMS-1446 | **Recette OK** | 2026-01-19 | ski-rental-duration-calc |
| CMDS-176481 | **Fermé** | 2026-01-12 | - |
| CMDS-176521 | **Fermé** | 2026-01-08 | picture-format-mismatch |
| CMDS-176818 | **Fermé** | 2026-01-13 | - |

### Patterns KB (16 patterns - Post AUDIT 2026-01-27)

| Pattern | Source | Type | Description |
|---------|--------|------|-------------|
| add-filter-parameter | PMS-1373 | Enhancement | Ajouter paramètre pour filtrer Range/Locate |
| date-format-inversion | CMDS-174321 | Bug logique | Inversion MM/DD dans parsing dates |
| local-config-regression | PMS-1407 | Non-bug | Fausse régression (Magic.ini local) |
| modedayinc-date-display | PMS-1437 | Bug affichage | Décalage date avec MODEDAYINC |
| picture-format-mismatch | CMDS-176521 | Bug format | Mauvaise variable dans expression affichage |
| ski-rental-duration-calc | PMS-1446 | Nouvelle fonction | Calcul conditionnel durée séjour |
| table-link-missing | PMS-1451 | Bug données | Jointure table manquante |
| empty-date-as-noend | PMS-1332 | Enhancement | Accepter 00/00/0000 sans limite |
| report-column-enhancement | PMS-1400 | Enhancement | Ajouter colonnes/totaux rapport |
| filter-not-implemented | PMS-1404 | Evolution | Filtres demandés non codés |
| equipment-config-issue | CMDS-176818 | Diagnostic | Problème hardware vs code |
| session-concurrency-check | PMS-1337 | Bug concurrence | Double ouverture session |
| missing-dataview-column | - | Bug structure | Variable absente DataView |
| missing-vv-condition | - | Bug logique | Virtual Variable sans condition |
| missing-time-validation | - | Bug validation | Validation heure manquante |
| extension-treated-as-arrival | - | Bug logique | Extension = nouvelle arrivée |

## Bases de donnees

### Validee
- **Serveur**: LENOVO_LB2I\SQLEXPRESS
- **Base**: CSK0912
- **Modules testes**: MECANO, Caisse (API C# .NET 8)

### A tester
- Base 1: (a definir)
- Base 2: (a definir)

## Changelog

> Historique complet: `.openspec/history/changelog.md`

**Derniers changements:**
- 2026-01-29: **Pipeline Ticket v2.0 Hybride** - Architecture hybride PS1+Claude. (1) Refactoring Phase 1 (3 sources: Jira/Index/Fichiers, keywords, attachments), (2) Refactoring Phase 2 (callers/callees KB SQLite), (3) Fix BOM UTF-8 toutes phases, (4) Fix Phase 5 Hashtable serialization + $Matches variable PS auto, (5) Consolidation auto-consolidate.ps1 < 30KB, (6) Template ANALYSIS.md 9 sections, (7) Skill + protocole mis a jour. **Teste: PMS-1427 6/6 (55 progs, 2 patterns), PMS-1419 6/6 (4 progs)**
- 2026-01-28: **Workflow APEX 4-Phase V4.0** - Implementation complete du workflow de specification en 4 phases: (1) DISCOVERY - identification, ECF, orphan check, (2) MAPPING - tables R/W/L, parametres, (3) DECODE - expressions, regles metier, (4) SYNTHESIS - spec 3 onglets + Mermaid. Script: `Generate-SpecV40.ps1`. README spec-generator/ mis a jour. Teste sur ADH IDE 237 et 121 (complexite HAUTE).
- 2026-01-27: **AUDIT PDCA Phase 5 (ACT FINAL)** - **GAP CRITIQUE CORRIGE**: 321/322 specs vides maintenant peuples avec donnees reelles. (1) KbIndexRunner `spec-data` command (JSON export), (2) Populate-SpecData.ps1 reecrit pour utiliser CLI au lieu de SQLite direct. **Resultats: 2522 tables, 5830 expressions, 820 callers, 834 callees extraits**
- 2026-01-27: **AUDIT PDCA Phase 4 (ACT)** - (1) Populate-SpecData.ps1 pour peupler 322 specs vides avec donnees MCP, (2) README spec-generator/, (3) README ticket-pipeline/, (4) Fix 24 warnings C# (CS8625, CS1998, CS0168), (5) TreatWarningsAsErrors dans csproj, (6) Template blueprint corrige (nullable, Task.FromResult). **Gap critique identifie: 322/323 specs sans data**
- 2026-01-27: **AUDIT PDCA Phase 3** - (1) Dashboard analytics patterns KB (HTML, 16 patterns, coverage 73%), (2) Tests E2E Playwright API Caisse (api-caisse.spec.ts), (3) Documentation API complete (125 endpoints, API_CAISSE_DOCUMENTATION.md), (4) Blueprints generator validé (limitation: specs V3.5 sans tables détaillées). Scripts: generate-patterns-dashboard.ps1
- 2026-01-27: **AUDIT PDCA Phase 2** - (1) Linking specs-patterns bidirectionnel (235/323, 73%), (2) Tests spec-generator (25/25, 100%), (3) Upgrade 322 specs V2.0→V3.5 (TAB markers + Mermaid), (4) Strategie migration C# documentee (22.6%→40% M+1). Scripts: link-specs-patterns.ps1, Upgrade-SpecsToV35.ps1, test-spec-generator.ps1
- 2026-01-27: **AUDIT PDCA Phase 1** - Archive magic-logic-parser v1-v4 dans tools/_archive, README tools/scripts (66 scripts), +4 patterns KB (16 total, 80%), Tests MCP valides 88/88. Scorecard: MCP A+, Patterns B+, Migration C (22.6%)
- 2026-01-26: **Spec Capitalization Implementation P1-P3** - (P1-A) auto-find-programs.ps1 spec context injection, (P1-D) sync-patterns-to-kb.ps1 bidirectional links + known_patterns_json, (P2-C) RegressionDetectionTool.cs (magic_detect_regression, magic_spec_drift_report), (P3-B) Generate-MigrationBlueprint.ps1 C# code skeleton, (P3-E) Generate-TestsFromSpec.ps1 xUnit/Vitest scaffolds
- 2026-01-26: **Spec Capitalization Plan Complete** - 4 phases implementees: (1) SpecReaderTool + viewer search, (2) KB indexing + pattern-spec integration, (3) validation hook v3.1 + auto-regeneration pipeline, (4) magic_precheck_change + impact matrices. 6 nouveaux scripts, 3 MCP tools, CI/CD workflow
- 2026-01-26: **Phase 0 Ecosystem Optimization** - PatternSyncService.cs (sync Markdown→KB), 2 outils MCP (magic_pattern_sync, magic_pattern_status), 5 tests unitaires, diagnostic ADH XML (360 fichiers valides)
- 2026-01-25: **Analyse Jira automatisée** - Extraction 10 tickets résolus, sync dates Jira, +2 patterns KB (local-config-regression, modedayinc-date-display), fix script test-jira-auth.ps1
- 2026-01-25: **ChangeImpactTool.cs** - 4 outils MCP Tier 5 (magic_impact_program, magic_impact_table, magic_impact_expression, magic_impact_crossproject) + Schema v5 + analyze-impact CLI
- 2026-01-25: **EcfRegistryTool.cs** - 4 outils MCP Tier 4 (magic_ecf_list, magic_ecf_programs, magic_ecf_usedby, magic_ecf_dependencies) + Schema v4 + 762 composants
- 2026-01-25: **VariableLineageTool.cs** - 2 outils MCP Tier 3 (magic_variable_lineage, magic_variable_sources) + Schema v3 (variable_modifications)
- 2026-01-25: **sync-patterns-to-kb.ps1** - Tier 2: Import patterns Markdown vers KB SQLite avec FTS5
- 2026-01-25: **PatternFeedbackTool.cs** - 4 outils MCP Tier 1 (search, stats, link, feedback) pour boucle retour tickets/patterns
- 2026-01-25: **track-metrics.ps1 RecordPatternUsage** - Tier 1: Lie tickets aux patterns, incremente usage_count
- 2026-01-24: **MigrationSpecTool.cs** - 4 outils MCP pour extraction specs migration (inventory, dependencies, stats, projects)
- 2026-01-24: **DecodeExpressionTool cache** - Integration ExpressionCacheService pour cache persistant expressions
- 2026-01-24: **Schema KB v2** - 3 nouvelles tables (decoded_expressions, ticket_metrics, resolution_patterns)
- 2026-01-24: **ExpressionCacheService** - Cache expressions decodees pour eviter recalcul offsets
- 2026-01-24: **auto-capitalize-pattern.ps1** - Extraction et capitalisation patterns KB depuis analysis.md
- 2026-01-24: **track-metrics.ps1** - Suivi metriques analyse tickets (temps, succes, patterns)
- 2026-01-24: **MigrationExtractor.cs** - Requetes KB pour extraction cahier des charges migration
- 2026-01-24: **Generate-MigrationSpec.ps1** - Generation automatique specs migration par projet
- 2026-01-24: **auto-trace-flow.ps1** - Ajout extraction Forms et Controls UI
- 2026-01-24: **validate-ticket-analysis.ps1** - Verification sections obligatoires
- 2026-01-24: **magic_get_form_controls** - nouvel outil MCP pour parser les Controls UI (boutons, champs, tables)
- 2026-01-24: **ProjectDiscoveryService** - service centralise pour decouverte dynamique des projets
- 2026-01-24: **KbIndexRunner validate** - mode validation integrite KB (9 checks)
- 2026-01-24: **magic_get_forms** - nouvel outil MCP pour afficher les Forms (UI screens)
- 2026-01-24: **Offsets dynamiques** - calcul automatique du Main offset au chargement
- 2026-01-24: +6 outils MCP (orphan detection, dead code, project health)
- 2026-01-24: Nouvelle regle magic-analysis.md pour workflow tickets
- 2026-01-22: Parser Magic V3 deterministe 100%

---
*Derniere mise a jour: 2026-01-28 (Post Workflow APEX 4-Phase)*
