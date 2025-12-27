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
| ADH | `D:\Data\Migration\XPA\PMS\ADH\Source\` | 350 | Adherents/Caisse | En analyse |
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

- [x] **ADH/Gestion Caisse** - API C# .NET 8 COMPLETE - Valide 2025-12-27
  - Solution: `migration/caisse/Caisse.sln`
  - 5 projets: Domain, Application, Infrastructure, Api, Shared
  - 9 tables mappees, 8 entites, EF Core 8 + CQRS (MediatR)
  - **24 endpoints** couvrant toutes les tables + ecarts
  - Swagger: http://localhost:5287/swagger
  - Tables: sessions, devises, articles, details, coffre, parametres, devises-ref, caisse-devises
  - **Flux ouverture/fermeture complet:**
    - Ouverture: cree session + 4 details (I, C, K, L) + coffre
    - Fermeture: validation ecart, blocage si > seuil, force avec commentaire
    - Types mouvements: I (Initial), C (Comptage), K (CoffretVers), L (CoffretLeve)
    - Moments: O (Ouverture), F (Fermeture), P (Pendant)
  - **Logique metier ecarts:**
    - Value Objects: `EcartSession`, `EcartMontants`, `EcartDevise`
    - Service: `IEcartCalculator` avec regles metier completes
    - Calcul: V, F, D, L ajoutent; A, K soustraient
    - Validation: SeuilAlerte configurable, ForceClosureOnEcart
  - **108 tests unitaires** (validators + ecarts + coffre)
  - Commits: `ee415a0` (coffre), `c3250fd` (fix null), `168deb3` (validation commentaire)

### Modules en cours

- [ ] **ADH** - Autres modules (309 progs restants)
  - Priorite 2: Ventes (24 progs)
  - Priorite 3: Telephone (20 progs)

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
- [ ] Completer niveau 4 (Editions/exports)
- [ ] Migrer un programme ADH simple vers TypeScript

### En cours
- (aucune)

### Terminees
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

### Plan actuel: Prochaines etapes

1. ~~Ajouter logique metier manquante (validation, calculs ecarts)~~ FAIT
2. ~~Implementer flux complet ouverture/fermeture (coffre, devises)~~ FAIT
3. Migrer module Ventes (24 progs)
4. Tests d'integration avec donnees reelles

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
*Derniere mise a jour: 2025-12-27 20:20*
