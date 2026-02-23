# Migration Factory CLI - OpenSpec

## Vue d'ensemble

CLI reusable pour migrer des systemes legacy vers des applications web modernes, module par module.
Pipeline SPECMAP complet: extraction, mapping, gap analysis, contrats, enrichissement, verification.

## Architecture

- **CLI**: 15 commandes (init, graph, modules, dashboard, plan, report, set-status, verify, gaps, reclassify, pipeline, serve, calibrate, generate, migrate, analyze)
- **Pipeline SPECMAP**: 6 etapes par programme (EXTRACT -> MAP -> GAP -> CONTRACT -> ENRICH -> VERIFY)
- **Dashboard**: HTTP server interactif avec SSE streaming
- **Code Generation**: Contrats -> React/TS scaffolds avec enrichissement AI

## Fonctionnalites

### Livrees (v12)
- [x] Pipeline orchestrator (run/status/preflight)
- [x] Claude API enrichment
- [x] Dashboard interactif + API REST
- [x] Multi-projet + calibration
- [x] Streaming SSE bout-en-bout
- [x] Code generation (contrats -> React/TS)
- [x] AI-assisted enrichment (heuristic, Claude API, Claude CLI)
- [x] Full 15-phase migration pipeline
- [x] Project analyzer + modules fonctionnels
- [x] maxBatchSize splitting + decision logging

### A traiter
- [ ] Monorepo integration (imports, paths)

### En cours

### Terminees

## Decisions

| Date | Decision | Contexte | Alternatives rejetees |
|------|----------|----------|----------------------|
| 2026-02-23 | Monorepo migration | Deplace dans packages/factory-cli/ | Rester dans tools/ |

## Preferences Projet

| Preference | Valeur | Raison |
|------------|--------|--------|
| Tests | Vitest (458 tests) | Rapide, compatible ESM |
| Module | Node16 | Compatibilite Node.js native |
| Target | ES2022 | Minimum pour top-level await |
