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
  - **Interface graphique complete:** 12 ecrans SPA (HTML/CSS/JS)
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

  **Ecrans SPA (depuis Main > Prg_162):**
  | Ecran | Programmes | Description |
  |-------|------------|-------------|
  | index.html | Prg_162 | Menu principal Gestion Caisse |
  | zooms.html | Prg_164-189 | Tables de reference (8 zooms) |
  | telephone.html | Prg_202-220 | Lignes telephone (OPEN/CLOSE/STATS) |
  | change.html | Prg_20-25 | Operations de change devises |
  | ventes.html | Prg_229-250 | Gift Pass, Resort Credit, Historique |
  | extrait.html | Prg_69-76 | Extrait de compte avec filtres |
  | garanties.html | Prg_111-114 | Depots et cautions |
  | easycheckout.html | Prg_53-67 | Workflow Easy Check-Out |
  | factures.html | Prg_54,89-97 | Gestion facturation TVA |
  | changement-compte.html | Prg_27-37 | Separation/Fusion comptes |

- [x] **ADH/Ventes - Prg_237 Solde Gift Pass** - Migre 2025-12-27
  - Endpoint: `GET /api/ventes/solde-giftpass/{societe}/{compte}/{filiation}`
  - Table: `ccpartyp` (cc_total_par_type)
  - Query CQRS: GetSoldeGiftPassQuery
  - 8 tests unitaires (validator)

- [x] **ADH/Ventes - Prg_250 Solde Resort Credit** - Migre 2025-12-27
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

- [x] **ADH/Members - Prg_160 GetCMP** - Migre 2025-12-27
  - Endpoint: `GET /api/members/club-med-pass/{societe}/{compte}/{filiation}`
  - Table: `ezcard` (ez_card)
  - Query CQRS: GetClubMedPassQuery
  - Retourne: CardCode si status != 'O' (Opposition)
  - 14 tests unitaires (validator)

- [x] **ADH/Solde - Prg_192 SOLDE_COMPTE** - Migre 2025-12-28
  - Endpoint: `GET /api/solde/{societe}/{compte}/{filiation}`
  - Tables: operations (operations_dat), ccpartyp (cc_total_par_type)
  - Query CQRS: GetSoldeCompteQuery
  - Calcul: SUM(Credit) - SUM(Debit) par service
  - 7 tests unitaires

- [x] **ADH/Ventes - Prg_238 Historique** - Migre 2025-12-28
  - Endpoint: `GET /api/ventes/historique/{societe}/{compte}/{filiation}`
  - Table: ccventes (cc_ventes)
  - Query CQRS: GetHistoVentesQuery
  - Liste toutes les ventes avec tri par date
  - 7 tests unitaires

- [x] **ADH/Extrait - Prg_69 EXTRAIT_COMPTE** - Migre 2025-12-28
  - Endpoint: `GET /api/extrait/{societe}/{compte}/{filiation}`
  - Tables: operations (operations_dat), services (cafil048_dat)
  - Query CQRS: GetExtraitCompteQuery
  - Mouvements tries par date avec cumul progressif
  - 7 tests unitaires

- [x] **ADH/Garantie - Prg_111 GARANTIE** - Migre 2025-12-28
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

### A traiter
- [ ] Tests d'integration sur CSK0912
- [ ] Documentation utilisateur API

### En cours
- [ ] Mise en production et tests finaux

### Terminees
- [x] **Analyse Main/Prg_162 + 6 ecrans** (terminee: 2025-12-31) - Tracage flux CallTask, 3 gaps API combles, 6 ecrans SPA crees
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
- [x] **Phase 2: Members (Prg_160 GetCMP)** (terminee: 2025-12-27) - Endpoint members/club-med-pass, 145 tests
- [x] **Phase 1: Zooms (8 endpoints)** (terminee: 2025-12-27) - 7 tables REF, ecran interactif, fix decimal/double
- [x] **Migration Prg_250 Solde Resort Credit** (terminee: 2025-12-27) - Dashboard HTML, 131 tests
- [x] **Migration Prg_237 Solde Gift Pass** (terminee: 2025-12-27) - Premier programme Ventes migre, 10 tables, 116 tests
- [x] **Flux coffre ouverture/fermeture** (terminee: 2025-12-27) - 4 details ouverture (I,C,K,L), validation ecart, 108 tests
- [x] **Logique metier ecarts** (terminee: 2025-12-27) - Value Objects, IEcartCalculator, validation fermeture
- [x] **API Caisse complete** (terminee: 2025-12-27) - 24 endpoints, 9 tables, Clean Architecture
- [x] Analyse Prg_131 Fermeture caisse (terminee: 2025-12-26) - 17 params, 22 sous-taches, 10 tables REF, 21 progs externes
- [x] Exploration PBG et PVE (terminee: 2025-12-24) - 394+448 progs, roles identifies
- [x] Analyse Prg_122 Ouverture caisse (terminee: 2025-12-24) - 15 params, 9 sous-taches, 3 tables REF
- [x] Amelioration skill tables (terminee: 2025-12-24) - Colonnes detaillees, codes StoredAs
- [x] Migration MECANO (terminee: 2025-12-22) - Scripts SQL valides sur CSK0912
- [x] Identification composants ADH (terminee: 2025-12-24) - 30 programmes partages identifies
- [x] Analyse Gestion Caisse (terminee: 2025-12-24) - 41 progs, flux principal identifie
- [x] Analyse tables REF Prg_121 (terminee: 2025-12-24) - 6 tables identifiees et documentees
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
| 2025-12-27 | Ecarts via Domain Service | Logique metier dans IEcartCalculator, testable | Calcul inline dans handler |
| 2025-12-27 | Seuil alerte configurable | Parametre SeuilAlerte avec ForceClosureOnEcart | Seuil fixe en config |
| 2025-12-27 | Clean Architecture + CQRS | Separation claire, testabilite | N-tier classique |
| 2025-12-27 | EF Core 8 + Minimal API | Stack moderne .NET 8 | Dapper seul, Controllers |
| 2025-12-22 | SQL Server comme cible MECANO | Base existante CSK0912 | PostgreSQL (pas de base dispo) |
| 2025-12-24 | Priorite ADH/Gestion Caisse | Module le plus critique (41 progs) | Ventes, Telephone |

## Bases de donnees

### Validee
- **Serveur**: LENOVO_LB2I\SQLEXPRESS
- **Base**: CSK0912
- **Modules testes**: MECANO, Caisse (API C# .NET 8)

### A tester
- Base 1: (a definir)
- Base 2: (a definir)

## Changelog

- 2026-01-04: **Skill enrichi: Detection code desactive** - ISEMPTY_TSK pour programmes vides, Disabled val="1" pour lignes, 9 progs vides + 354 lignes exclus
- 2026-01-04: **Rapport couverture complet** - `.openspec/reports/COVERAGE_REPORT_2025-01-04.md`, 85.5% couverture, 12 ecrans SPA, ~125 endpoints
- 2026-01-04: **Verification REF.ecf** - 5 progs (800,877,895,1066,1095) identifies comme compiles (.eci), non analysables en source
- 2025-12-31: **Analyse Main/Prg_162 complete** - Tracage flux CallTask, couverture API validee, 3 gaps combles (DetailAppels, MenuTelephone, ZoomServicesVillage)
- 2025-12-31: **6 ecrans SPA crees** - ventes.html, extrait.html, garanties.html, easycheckout.html, factures.html, changement-compte.html
- 2025-12-31: Navigation modules ajoutee a index.html - Panel fixe avec liens vers tous les ecrans
- 2025-12-29: **MIGRATION ADH COMPLETE** - 527 tests unitaires (100% pass), ~70 endpoints, 18 modules migres, build Release operationnel
- 2025-12-29: Fix validators Societe (MaxLength 2->10), correction tests Ventes orphelins, nettoyage fichiers agents
- 2025-12-28: **Interface Graphique Complete** - 15 ecrans SPA (dashboard, sessions, ventes, EzCard, depot, etc.), 411 tests total
- 2025-12-28: **Phase 12: Divers** - 5 programmes prioritaires (Prg_42,43,45,47,48), 5 endpoints, 458 tests total
- 2025-12-28: **Phase 12: Depot** - GetExtraitDepot + RetirerDepot, 2 endpoints
- 2025-12-28: **Phase 12: EzCard** - GetEzCardByMember + DesactiverEzCard + ValiderCaracteres, 3 endpoints
- 2025-12-28: **Phase 11: Identification** - VerifierOperateur + VerifierSessionCaisse, 327 tests total
- 2025-12-28: **Phase 10: Factures** - GetFacturesCheckOut + CreerFacture, calcul TVA
- 2025-12-28: **Phase 9: EasyCheckOut** - Edition + Extrait queries, complete workflow
- 2025-12-28: **Phase 8: Telephone** - LigneTelephone entity, 2 endpoints (get/gerer), OPEN/CLOSE commands
- 2025-12-28: **Phase 7: Change** - TauxChange entity, 3 endpoints (devise-locale/taux/calculer), logique conversion bidirectionnelle
- 2025-12-28: **Phase 3-6: Solde, Ventes, Extrait, Garantie** - 4 nouvelles queries, 7 entites, 52 tests validators
- 2025-12-27: **Phase 2: Members (Prg_160 GetCMP)** - Endpoint /api/members/club-med-pass, table ezcard, 14 tests, 145 tests total
- 2025-12-27: **Phase 1: Zooms (8 endpoints)** - 7 tables REF, 7 entites, ecran interactif /zooms.html, fix decimal->double
- 2025-12-27: **Migration Prg_250 Solde Resort Credit** - Endpoint /api/ventes/solde-resortcredit, table resort_credit, dashboard HTML visuel, 131 tests
- 2025-12-27: **Migration Prg_237 Solde Gift Pass** - Premier programme Ventes migre vers C#, endpoint /api/ventes/solde-giftpass, table ccpartyp, 116 tests
- 2025-12-27: **Flux coffre complet** - Ouverture avec 4 details (I,C,K,L) + coffre, fermeture avec validation ecart, 108 tests
- 2025-12-27: Fix entites non-null pour DB (commentaire_ecart, montants) + validation CommentaireEcart max 30 car
- 2025-12-27: **Logique metier ecarts** - Value Objects (EcartSession, EcartMontants, EcartDevise), IEcartCalculator, validation fermeture avec seuil
- 2025-12-27: FluentValidation + tests - 7 validators, ValidationBehavior pipeline
- 2025-12-27: **MILESTONE: API Caisse COMPLETE** - 24 endpoints, 9 tables, Clean Architecture
- 2025-12-26: API Caisse C# .NET 8 fonctionnelle - Solution 5 projets, 9 tables, 32 sessions lues depuis CSK0912
- 2025-12-26: Analyse Prg_131 Fermeture caisse - 22 sous-taches, 10 tables REF, architecture WS (13 services)
- 2025-12-24: Exploration PBG (394 progs) et PVE (448 progs) - roles et composants identifies
- 2025-12-24: Analyse Prg_122 complete - 15 params, 9 sous-taches, tables caisse_devise/devisein_par/cafil045_dat
- 2025-12-24: Amelioration skill tables - StoredAs codes (6=float, 32=nvarchar) documentes
- 2025-12-24: Guide ECRANS complet cree - ecrans-guide.md (Controls, Events, Forms)
- 2025-12-24: Guide EDITIONS complet cree - editions-guide.md (Area, Groups, Page/Counter)
- 2025-12-24: Guide EXPORTS complet cree - exports-guide.md (Media types, FormIO, FORM_TEXT)
- 2025-12-24: Analyse COMPLETE 40 fichiers XML (10 par projet) - gaps-analysis-complete.md
- 2025-12-24: Analyse 10 fichiers XML (ADH/PBP/REF/PBG) - Creation gaps-analysis.md
- 2025-12-24: Creation xml-structure-guide.md - Guide complet structure XML pour conversion
- 2025-12-24: Analyse Prg_122 (Ouverture caisse) - Structure XML maitrisee
- 2025-12-24: Analyse tables REF Prg_121 (6 tables: caisse_session, caisse_session_detail, caisse_parametres, cafil048_dat, user_dat, caisse_session_coffre2)
- 2025-12-24: Analyse complete Gestion Caisse (41 progs), doc GESTION_CAISSE_SPEC.md
- 2025-12-24: Ajout projet ADH, identification 30 programmes partages ADH.ecf
- 2025-12-24: Creation .openspec/spec.md (nouvelle structure)
- 2025-12-22: Validation MECANO sur base CSK0912
- 2025-12-22: Creation structure openspec/mecano/

---
*Derniere mise a jour: 2025-12-31 12:00*
