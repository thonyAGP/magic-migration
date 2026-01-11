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

**Inventaire des outils** (2026-01-10) :

| Categorie | Outils | Etat | Cible | Action |
|-----------|--------|------|-------|--------|
| MCP Server | 13 outils | 90% | 100% | Reconnecter + tests |
| Agents specialises | 5 agents | 100% | 100% | **NOUVEAU** |
| Commandes Slash | 15 commandes | 100% | 100% | Maintenir |
| Scripts PowerShell | 18 scripts | 100% | 100% | Maintenir |
| Parser TypeScript | 3 generateurs | 60% | 100% | Completer fonctions |
| Skill/References | 22 fichiers | 100% | 100% | Enrichir |

---

## 📋 PLAN VERS 100% - Roadmap detaillee

### 1. MCP Server (90% → 100%)

| Tache | Priorite | Effort | Statut |
|-------|----------|--------|--------|
| Reconnecter magic-interpreter | P0 | 5min | ⏳ Redemarrer session |
| Tests automatises des 13 outils | P1 | 2h | A faire |
| Gestion erreurs robuste | P2 | 1h | A faire |
| Documentation API MCP | P2 | 1h | A faire |

### 2. Agents specialises (100% - COMPLET)

| Agent | Fichier | Role | Statut |
|-------|---------|------|--------|
| magic-router | `.claude/agents/magic-router.md` | Routage intelligent | ✅ |
| magic-analyzer | `.claude/agents/magic-analyzer.md` | Analyse programmes | ✅ |
| magic-debugger | `.claude/agents/magic-debugger.md` | Resolution bugs | ✅ |
| magic-migrator | `.claude/agents/magic-migrator.md` | Generation code | ✅ |
| magic-documenter | `.claude/agents/magic-documenter.md` | Documentation | ✅ |

### 3. Parser TypeScript (60% → 100%)

| Composant | Actuel | Cible | Actions |
|-----------|--------|-------|---------|
| Lexer/Parser | 90% | 100% | Gerer cas limites |
| Fonctions Magic | 80/200 | 200/200 | Mapper 120 fonctions restantes |
| Generateur TS | 70% | 100% | Async/await, Decimal.js |
| Generateur C# | 70% | 100% | CQRS patterns, DateOnly |
| Generateur Python | 50% | 100% | FastAPI patterns |
| Tests unitaires | 30% | 80% | Ajouter 50+ tests |

**Fonctions prioritaires a mapper** :
- Dates : `DStr`, `MVal`, `YVal`, `AddDate`, `DVal`
- Strings : `Mid`, `Left`, `Right`, `InStr`, `Replace`
- Calculs : `Round`, `Abs`, `Mod`, `Min`, `Max`
- DB : `Counter`, `DBRecs`, `DBRecsRng`
- Flow : `CallProg`, `CallTask`, `ExitProg`

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
- [ ] **P1.5** Completer parser TypeScript (120 fonctions)
- [ ] **P1.6** Tests automatises outils MCP

### A traiter
- [ ] Tests d'integration sur CSK0912
- [ ] Documentation utilisateur API

### En cours
- [x] **P1.1** Reparer connexion MCP magic-interpreter (en cours: 2026-01-10)

### Terminees
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

### Tickets actifs

| Ticket | Statut | Domaine | Description |
|--------|--------|---------|-------------|
| PMS-1446 | **SPEC COMPLETE** | POS/Location | Location ski courts sejours - Calcul auto MODEDAYINC selon duree sejour |
| PMS-1373 | **SPEC COMPLETE** | Extrait | Masquer annulations (+/-) dans extrait compte - Branche feature/PMS-1373 |
| CMDS-174321 | **RÉSOLU** | dates | Bug date arrivee PB027 (+1 mois) - Cause: données corrompues en base |
| CMDS-176521 | **DIAGNOSTIC OK** | POS/PVE | Prix remise affiche 41,857 au lieu de 5,400 - PVE IDE 186/201 analyses, bug Picture Format |

## Bases de donnees

### Validee
- **Serveur**: LENOVO_LB2I\SQLEXPRESS
- **Base**: CSK0912
- **Modules testes**: MECANO, Caisse (API C# .NET 8)

### A tester
- Base 1: (a definir)
- Base 2: (a definir)

## Changelog

- 2026-01-11: **HOOK POSTTOOLUSE IDE MAGIC IMPLEMENTE** - Script `validate-magic-ide-format.ps1` cree. Detecte patterns XML interdits (Prg_\d+, FieldID, ISN, {0,3}). Affiche violations avec format correct attendu. Cible agents magic-* + contexte Magic. Tests valides: 6 errors + 5 warnings detectes, clean output OK, skip non-Magic OK
- 2026-01-11: **VEILLE TECHNOLOGIQUE COMPLETE** - Claude Code 2.1.0 (agent hooks, real-time thinking), MCP Nov 2025 (parallel calls, Tasks API), TypeScript 2025 best practices. 5 actions recommandees: Hook PostToolUse IDE Magic (HAUTE), Parallel Calls MCP (MOYENNE), Upgrade CC 2.1.0 (MOYENNE), Tasks API prototype (BASSE), --experimental-strip-types (BASSE). Rapport: `.openspec/veille-report-2026-01-11.md` + page HTML interactive. Prochain: 18 janvier
- 2026-01-11: **REFERENCE RAPIDE TOP 30 FONCTIONS** - Extraction documentation CHM Magic xpa 2.3 (484 fichiers HTM). Reference rapide creee: `quick-reference-top30.md`. 30 fonctions critiques avec equivalences TS/C#/Python. Source: `C:\Appwin\Magic\Magicxpa23\Support\mghelpw_extracted\`
- 2026-01-10: **ARCHITECTURE MAGIC ROUTER COMPLETE** - 5 agents specialises crees (magic-router, magic-analyzer, magic-debugger, magic-migrator, magic-documenter). Detection automatique d'intention + routage intelligent. Regles IDE renforcees dans CLAUDE.md. Plan 100% documente avec roadmap detaillee
- 2026-01-10: **REGLES POSITION XML→IDE VALIDEES** - Script parse-dataview.ps1 V2 complet. Tables: XML obj=ItemIsn→Comps.xml id=IDE position. Programmes: IDE position=ordre dans ProgramsRepositoryOutLine. Variables: A-Z, AA-ZZ numerotation correcte. Colonnes: sequentielles Main Source, vrais IDs pour Links. Tests valides: ADH 294→IDE 297, ADH 159→IDE 160. Documentation: xml-position-rules.md, dataview-parsing-rules.md
- 2026-01-08: **MCP XmlIndexer REWRITE** - Correction complete du parsing XML. Structure reelle: Task>Header (pas TaskDefinition), Task>Resource>Columns, Task>TaskLogic>LogicUnit>LogicLines. Nouvel outil magic_dump_dataview pour diagnostic. Tables composants via Comps.xml (id/ItemIsn/PublicName mapping)
- 2026-01-09: **PMS-1446 SPEC COMPLETE** - Location materiel ski courts sejours. Analyse PVE IDE 186/139/256. Solution: calcul auto MODEDAYINC selon duree sejour (< 7 nuits = jour meme, >= 7 = lendemain). Seuil configurable via table. Spec implementation.md creee
- 2026-01-08: **MCP Tool magic_get_line** - Nouvel outil pour lookup deterministe ligne Data View ET Logic. Parsing colonnes (MagicColumn model, A-Z/AA-ZZ naming). Numerotation Logic continue a travers handlers. Commande /magic-line mise a jour
- 2026-01-08: **OpenSpec Viewer ONLINE** - Deploiement Vercel sur https://jira.lb2i.com/viewer.html. API serverless pour gestion tickets (archive/unarchive/statut) avec commit auto GitHub. Service Windows local installe au demarrage
- 2026-01-08: **CMDS-176521 DIAGNOSTIC COMPLET** - Bug affichage prix remise POS (41,857 au lieu de 5,400). PVE IDE 186 (Main Sale) et PVE IDE 201 (Discounts) analyses. Calcul correct (Expression 30/33), bug dans Picture Format ou binding formulaire. Ticket dev ouvert par Davide, fix prevu fin janvier
- 2026-01-08: **PMS-1373 Spécification COMPLETE** - Découverte champ `cte_flag_annulation` existant (valeurs Normal/Annulation/X-annule). Solution simplifiée: filtre WHERE au lieu de matching +/-. Spec implementation.md créée. Branche feature/PMS-1373-masquer-annulations. Sources synchronisées GitHub (thonyAGP/PMS-Magic-Sources)
- 2026-01-07: **CMDS-174321 RÉSOLU - Analyse fichiers NA** - PREUVES: fichiers source NA (RV.HST) contiennent dates CORRECTES (251225=25/12/25) pour tous les SEEDSMAN. Le BUG est dans l'IMPORT PMS (PBG IDE 315), pas dans les données NA. Hypothèse: inversion MM/DD lors conversion date pour filiation 004 uniquement. SQL correction fourni
- 2026-01-07: **PMS-1373 Analyse ADH IDE 69 EXTRAIT_COMPTE** - Structure complete (466KB, 12 sous-taches). Flux edition identifie (Choix_action → ADH IDE 70/71/72/73/76). Point d'injection: sous-tache 5 "scroll sur compte". Skill enrichi: section "Analyse par Troncons" pour fichiers volumineux
- 2026-01-07: **Interface Gestion Tickets Jira** - Menu CLI au demarrage (hook SessionStart), 4 commandes (/ticket, /ticket-new, /ticket-learn, /ticket-search), KB SQLite pour capitalisation, structure .openspec/tickets/{KEY}/. Migration CMDS-174321 vers nouvelle structure. 5 scripts PS securises (.env credentials)
- 2026-01-07: **CMDS-174321 Analyse approfondie** - Tracage flux PB027 (PBG IDE 62→PBG IDE 63). Decouverte: terminal affiche date correcte (25DEC), GUI affiche erreur (25/01). Bug dans affichage GUI, pas import. Tables requises: cafil014_dat, table temp planning. Attente base VPHUKET
- 2026-01-06: **Analyse CMDS-174321 + MCP Global Index** - Bug date arrivee (NA=25/12/2025, PMS=25/01/2026). Hypothese: inversion DD/MM vs MM/DD. 4 nouveaux outils MCP: magic_find_program, magic_list_programs, magic_index_stats, magic_get_dependencies. Rapport `.openspec/reports/CMDS-174321_ANALYSIS.md`
- 2026-01-06: **Documentation SADT projet ADH** - Analyse structuree complete. 9 modules fonctionnels, ~350 programmes, 27 dossiers, 20 tables. Rapport `.openspec/reports/ADH_SADT_DOCUMENTATION.md`
- 2026-01-06: **MCP Server Magic Interpreter** - Serveur MCP C# .NET 8 pour parsing XML deterministe. 5 outils: magic_get_position, magic_get_tree, magic_get_dataview, magic_get_expression, magic_get_logic. 2383 programmes indexes (PBP, REF, VIL, PBG, PVE). Config dans .claude/settings.local.json
- 2026-01-05: **Session 7: CallTask Advanced** - Wait disponible SEULEMENT pour Raise Event (pas Call SubTask/Program). Task ID = numero local (pas ISN_2). Skill enrichi avec tableau proprietes
- 2026-01-05: **Session 6: Settings Repositories** - Font Repository unifie (#1-23 Application, #24-151 Internal, #152+ Studio). Color Repository valide. Nouvelle section settings_repositories dans skill
- 2026-01-05: **Outil magic-ide-position cree** - Slash command pour convertir references XML en positions IDE. Format: PROJET IDE Nom: Description
- 2026-01-05: **CALIBRATION DLU VALIDEE** - Facteurs de conversion DLU→Pixels calibrés et validés: X=0.65, Y=2.0 (CA0142: 939×178 DLU → 610×356 px). Skill mis à jour section 13 et 15
- 2026-01-05: **Bug VIL ANALYSE COMPLETE** - Tache 22.16.1 Record Suffix conditionnel: lignes IDE 5 et 9, remplacer expression 31 par 32 (DK<>EU). Mapping XML id→IDE position documente
- 2026-01-05: **Skill: Convention nommage variables** - Variables DataView A-Z, AA-ZZ, AAA-ZZZ. Formule: DK = 4*26+11 = 115
- 2026-01-05: **Skill: Mapping expressions XML→IDE** - XML conserve id originaux avec trous, IDE renumérote séquentiellement. WithValue reference id XML, pas numero IDE
- 2026-01-05: **Skill enrichi: Debugging/Troubleshooting** - Dead Expressions, ExpCalc function, Remark comme indices, methodologie tracage WithValue, checklist debugging
- 2026-01-04: **CORRECTION CRITIQUE: Tracage flux ecrans** - Erreur identifiee: ADH IDE 162 considere a tort comme ecran visible alors que c'est un menu intermediaire. Flux reel: Main→ADH IDE 1→ADH IDE 162→ADH IDE 121 (CA0142). Ecran principal = ADH IDE 121 avec WindowType=2 (SDI)
- 2026-01-04: **ouverture-session.html (CA0143)** - Ecran cree depuis analyse ADH IDE 294. Grille 7 colonnes (Cash/Cartes/Cheques/Produits/TOTAL/OD/Devises), 6 lignes (Solde initial/Appro caisse/Appro produits/Caisse comptee/Controle PMS/Ecart). Boutons Abandon/Valider avec validation ecart
- 2026-01-04: **index.html corrige (CA0142)** - Reconstruction fidele depuis ADH IDE 121 avec tous les boutons (Ouvrir/Continuer/Fermer session, Appro, Regul Telecollecte, etc.) et zone info utilisateur/coffre/etat
- 2026-01-04: **Skill enrichi: Menu intermediaire vs Ecran visible** - Regles ajoutees: WindowType=2=SDI visible, tracage multi-niveaux obligatoire, ne pas s'arreter au premier CallTask
- 2026-01-04: **Skill: Flow Tracing & Window Types** - Documentation Window Types (Modal/SDI/MDI), flux d'execution Task Prefix→Suffix, methodologie tracage demarrage depuis MainProgram (ADH IDE 1→ADH IDE 162)
- 2026-01-04: **Navigation SPA complete** - sessions.html (ADH IDE 77/80/236), modales coffre (ADH IDE 233/234/235/163/197), panel navigation 11 ecrans
- 2026-01-04: **Skill enrichi: Detection code desactive** - ISEMPTY_TSK pour programmes vides, Disabled val="1" pour lignes, 9 progs vides + 354 lignes exclus
- 2026-01-04: **Rapport couverture complet** - `.openspec/reports/COVERAGE_REPORT_2025-01-04.md`, 85.5% couverture, 12 ecrans SPA, ~125 endpoints
- 2026-01-04: **Verification REF.ecf** - 5 progs (800,877,895,1066,1095) identifies comme compiles (.eci), non analysables en source
- 2025-12-31: **Analyse Main/ADH IDE 162 complete** - Tracage flux CallTask, couverture API validee, 3 gaps combles (DetailAppels, MenuTelephone, ZoomServicesVillage)
- 2025-12-31: **6 ecrans SPA crees** - ventes.html, extrait.html, garanties.html, easycheckout.html, factures.html, changement-compte.html
- 2025-12-31: Navigation modules ajoutee a index.html - Panel fixe avec liens vers tous les ecrans
- 2025-12-29: **MIGRATION ADH COMPLETE** - 527 tests unitaires (100% pass), ~70 endpoints, 18 modules migres, build Release operationnel
- 2025-12-29: Fix validators Societe (MaxLength 2->10), correction tests Ventes orphelins, nettoyage fichiers agents
- 2025-12-28: **Interface Graphique Complete** - 15 ecrans SPA (dashboard, sessions, ventes, EzCard, depot, etc.), 411 tests total
- 2025-12-28: **Phase 12: Divers** - 5 programmes prioritaires (ADH IDE 42,43,45,47,48), 5 endpoints, 458 tests total
- 2025-12-28: **Phase 12: Depot** - GetExtraitDepot + RetirerDepot, 2 endpoints
- 2025-12-28: **Phase 12: EzCard** - GetEzCardByMember + DesactiverEzCard + ValiderCaracteres, 3 endpoints
- 2025-12-28: **Phase 11: Identification** - VerifierOperateur + VerifierSessionCaisse, 327 tests total
- 2025-12-28: **Phase 10: Factures** - GetFacturesCheckOut + CreerFacture, calcul TVA
- 2025-12-28: **Phase 9: EasyCheckOut** - Edition + Extrait queries, complete workflow
- 2025-12-28: **Phase 8: Telephone** - LigneTelephone entity, 2 endpoints (get/gerer), OPEN/CLOSE commands
- 2025-12-28: **Phase 7: Change** - TauxChange entity, 3 endpoints (devise-locale/taux/calculer), logique conversion bidirectionnelle
- 2025-12-28: **Phase 3-6: Solde, Ventes, Extrait, Garantie** - 4 nouvelles queries, 7 entites, 52 tests validators
- 2025-12-27: **Phase 2: Members (ADH IDE 160 GetCMP)** - Endpoint /api/members/club-med-pass, table ezcard, 14 tests, 145 tests total
- 2025-12-27: **Phase 1: Zooms (8 endpoints)** - 7 tables REF, 7 entites, ecran interactif /zooms.html, fix decimal->double
- 2025-12-27: **Migration ADH IDE 250 Solde Resort Credit** - Endpoint /api/ventes/solde-resortcredit, table resort_credit, dashboard HTML visuel, 131 tests
- 2025-12-27: **Migration ADH IDE 237 Solde Gift Pass** - Premier programme Ventes migre vers C#, endpoint /api/ventes/solde-giftpass, table ccpartyp, 116 tests
- 2025-12-27: **Flux coffre complet** - Ouverture avec 4 details (I,C,K,L) + coffre, fermeture avec validation ecart, 108 tests
- 2025-12-27: Fix entites non-null pour DB (commentaire_ecart, montants) + validation CommentaireEcart max 30 car
- 2025-12-27: **Logique metier ecarts** - Value Objects (EcartSession, EcartMontants, EcartDevise), IEcartCalculator, validation fermeture avec seuil
- 2025-12-27: FluentValidation + tests - 7 validators, ValidationBehavior pipeline
- 2025-12-27: **MILESTONE: API Caisse COMPLETE** - 24 endpoints, 9 tables, Clean Architecture
- 2025-12-26: API Caisse C# .NET 8 fonctionnelle - Solution 5 projets, 9 tables, 32 sessions lues depuis CSK0912
- 2025-12-26: Analyse ADH IDE 131 Fermeture caisse - 22 sous-taches, 10 tables REF, architecture WS (13 services)
- 2025-12-24: Exploration PBG (394 progs) et PVE (448 progs) - roles et composants identifies
- 2025-12-24: Analyse ADH IDE 122 complete - 15 params, 9 sous-taches, tables caisse_devise/devisein_par/cafil045_dat
- 2025-12-24: Amelioration skill tables - StoredAs codes (6=float, 32=nvarchar) documentes
- 2025-12-24: Guide ECRANS complet cree - ecrans-guide.md (Controls, Events, Forms)
- 2025-12-24: Guide EDITIONS complet cree - editions-guide.md (Area, Groups, Page/Counter)
- 2025-12-24: Guide EXPORTS complet cree - exports-guide.md (Media types, FormIO, FORM_TEXT)
- 2025-12-24: Analyse COMPLETE 40 fichiers XML (10 par projet) - gaps-analysis-complete.md
- 2025-12-24: Analyse 10 fichiers XML (ADH/PBP/REF/PBG) - Creation gaps-analysis.md
- 2025-12-24: Creation xml-structure-guide.md - Guide complet structure XML pour conversion
- 2025-12-24: Analyse ADH IDE 122 (Ouverture caisse) - Structure XML maitrisee
- 2025-12-24: Analyse tables REF ADH IDE 121 (6 tables: caisse_session, caisse_session_detail, caisse_parametres, cafil048_dat, user_dat, caisse_session_coffre2)
- 2025-12-24: Analyse complete Gestion Caisse (41 progs), doc GESTION_CAISSE_SPEC.md
- 2025-12-24: Ajout projet ADH, identification 30 programmes partages ADH.ecf
- 2025-12-24: Creation .openspec/spec.md (nouvelle structure)
- 2025-12-22: Validation MECANO sur base CSK0912
- 2025-12-22: Creation structure openspec/mecano/

---
*Derniere mise a jour: 2026-01-06 - Documentation SADT projet ADH*
