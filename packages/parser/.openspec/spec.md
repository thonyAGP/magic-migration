# Magic Parser - OpenSpec

## Vue d'ensemble

Parseur complet pour la syntaxe d'expressions Magic Unipaas v12.03.
Supporte le parsing, la manipulation d'AST, et la generation de code vers TypeScript, C# et Python.

## Architecture

- **Lexer**: Tokenisation des expressions Magic
- **Parser**: Descente recursive -> AST
- **Functions**: 300+ fonctions Magic implementees
- **Visitor**: Visiteurs AST + generateurs de code multi-cibles
- **Types**: Tokens, noeuds AST, references speciales

## Fonctionnalites

### Livrees
- [x] Lexer complet (nombres, strings, booleans, field refs, operators)
- [x] Parser recursif descendant
- [x] AST manipulation
- [x] Code generation TypeScript
- [x] Code generation C#
- [x] Code generation Python
- [x] 300+ fonctions Magic supportees

### A traiter
- [ ] Package.json propre (monorepo)
- [ ] Tests independants

### En cours

### Terminees

## Decisions

| Date | Decision | Contexte | Alternatives rejetees |
|------|----------|----------|----------------------|
| 2026-02-23 | Monorepo migration | Deplace dans packages/parser/ | Rester dans src/parser/ |

## Preferences Projet

| Preference | Valeur | Raison |
|------------|--------|--------|
| Approche | Fonctionnelle pure | Pas d'effets de bord dans le parser |
| Multi-cible | TS, C#, Python | Migration vers differentes stacks |
