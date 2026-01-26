# Changelog Migration Magic Unipaas

> Historique detaille des modifications (separe de spec.md pour reduire le contexte)

## 2026

### Janvier 2026

- 2026-01-26: **CAPITALISATION OPTIMALE V3.0** - Implementation plan hybride G+D+B. Phase 1: Schema KB v7 (business_rules, task_details, spec_annotations, spec_call_graph, spec_baselines). Phase 2: GitHub Actions (spec-sync.yml, spec-drift-alert.yml). Phase 3: Render-Spec.ps1 (merge KB+YAML), Extract-BusinessRules.ps1, Generate-CallGraph.ps1. Template Spec V3.0, annotations YAML, render-config.yaml
- 2026-01-24: **OPTIMISATION CONTEXTE** - Separation changelog, deplacement business rules vers rules/business.md, prompt Lanceur_Claude cree
- 2026-01-22: **PARSER MAGIC V3 DETERMINISTE 100%** - Nouveau script `magic-logic-parser-v3.ps1` avec formule d'offset automatique et correcte. Formule: Offset = colonnes_ancetres_complets + colonnes_table_tache_cible. Teste sur VIL Prg_558 tache 19: Offset=131 EB, EU=v.FDR fermeture, EV=v.Session prec. Parsing ExpSyntax pour expressions. Documentation: `skills/magic-unipaas/references/dataview-offset-formula.md`
- 2026-01-18: **INFRASTRUCTURE GIT DOCUMENTEE** - Architecture 4 repos (S: origin, C: dev, D: analyse, GitHub backup). Commandes sync, gestion conflits .opt/ProgramHeaders, schema ASCII complet
- 2026-01-12: **MCP SERVER 100% COMPLET** - Tests unitaires C# (27/27 pass), hooks validation IDE Magic (PreToolUse + PostToolUse). Suite: `tools/MagicMcp.Tests/`. Patterns interdits detectes: Prg_XXX, {0,3}, ISN_2, FieldID, obj=XX
- 2026-01-12: **PARSER TYPESCRIPT COMPLET - 200 fonctions** - 4 fichiers generateurs: function-registry.ts, typescript-generator.ts, csharp-generator.ts, python-generator.ts
- 2026-01-11: **VEILLE TECHNOLOGIQUE** - Claude Code 2.1.0, MCP Nov 2025, TypeScript 2025 best practices
- 2026-01-10: **ARCHITECTURE MAGIC ROUTER** - 5 agents specialises (magic-router, magic-analyzer, magic-debugger, magic-migrator, magic-documenter)
- 2026-01-09: **PMS-1446 SPEC COMPLETE** - Location materiel ski courts sejours
- 2026-01-08: **MCP Tool magic_get_line** - Lookup deterministe ligne Data View ET Logic
- 2026-01-08: **PMS-1373 Specification COMPLETE** - Masquer annulations dans extrait compte
- 2026-01-07: **CMDS-174321 RESOLU** - Bug date arrivee corrige (donnees corrompues en base)
- 2026-01-06: **MCP Server Magic Interpreter** - 5 outils initiaux, 2383 programmes indexes
- 2026-01-05: **CALIBRATION DLU** - Facteurs X=0.65, Y=2.0 valides
- 2026-01-04: **CORRECTION FLUX ECRANS** - ADH IDE 162 = menu intermediaire, ADH IDE 121 = ecran principal

## 2025

### Decembre 2025

- 2025-12-31: **Analyse Main/ADH IDE 162** - Tracage flux CallTask, 6 ecrans SPA crees
- 2025-12-29: **MIGRATION ADH COMPLETE** - 527 tests unitaires, ~70 endpoints, 18 modules migres
- 2025-12-28: **Interface Graphique Complete** - 15 ecrans SPA, 458 tests total
- 2025-12-28: **Phases 7-12** - Change, Telephone, EasyCheckOut, Factures, Identification, EzCard, Depot, Divers
- 2025-12-27: **MILESTONE API CAISSE** - 24 endpoints, 9 tables, Clean Architecture
- 2025-12-27: **Phases 1-6** - Zooms, Members, Solde, Ventes, Extrait, Garantie
- 2025-12-26: **API Caisse C# .NET 8** - Solution 5 projets initiale
- 2025-12-24: **Exploration PBG/PVE** - 394+448 programmes analyses
- 2025-12-24: **Analyse Gestion Caisse** - 41 programmes, flux principal identifie
- 2025-12-22: **Migration MECANO** - Scripts SQL valides sur CSK0912

---
*Fichier genere le 2026-01-24 pour reduire le contexte session*
