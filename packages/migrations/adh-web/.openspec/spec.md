# ADH Web - OpenSpec

## Vue d'ensemble

Migration web de l'application ADH (Adherents/Caisse) depuis Magic Unipaas v12.03.
Application React 19 pour la gestion de caisse, comptes adherents, et operations financieres.

## Architecture

- **Pages**: Une page par programme Magic migre
- **Stores**: Zustand avec pattern mock/API
- **UI**: Composants reutilisables (Dialog, DataGrid, etc.)
- **API**: Proxy vers Caisse API C# (port 5287)

## Fonctionnalites

### Batches Migration

| Batch | Domaine | Status |
|-------|---------|--------|
| B1 | Ouverture session (8 progs) | 100% VERIFIED |
| B2 | Caisse (17 progs) | En cours |
| B3-B18 | General, Impression, Compte, Change, Stock, Ventes, Divers | Pending |

### A traiter
- [ ] Continuer migration B2 (Caisse)
- [ ] Fix tests apres monorepo move

### En cours

### Terminees
- [x] B1 - Ouverture session (18/18 contrats verified)
- [x] B2 - Caisse (12 programmes, 120 fichiers)

## Decisions

| Date | Decision | Contexte | Alternatives rejetees |
|------|----------|----------|----------------------|
| 2026-02-23 | Monorepo migration | Deplace dans packages/migrations/adh-web/ | Rester dans adh-web/ |
| 2026-02-19 | deviseCode prop-based | ApproProduitsForm + TelecollectePanel | Variable globale |

## Preferences Projet

| Preference | Valeur | Raison |
|------------|--------|--------|
| State | Zustand | Leger, simple, compatible React 19 |
| CSS | Tailwind v4 | Utility-first, v4 avec @theme |
| Forms | React Hook Form + Zod | Validation typee |
| Icons | Lucide React | Coherent, tree-shakable |
| Port dev | 3071 | Registre ports monorepo |
| Port storybook | 3072 | Registre ports monorepo |
