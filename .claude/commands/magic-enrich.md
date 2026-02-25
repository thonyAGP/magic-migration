---
description: Enrich React code based on a SPECMAP migration contract
arguments:
  - name: program_id
    description: "IDE number of the program (e.g. 122)"
    required: true
---

# Enrichissement du code React selon contrat SPECMAP

Implemente les gaps identifies dans le contrat de migration pour ADH IDE $ARGUMENTS.

## Prerequis

- Le contrat `.openspec/migration/ADH-IDE-$ARGUMENTS.contract.yaml` doit exister
- Le contrat doit avoir status `contracted`
- La spec `.openspec/specs/ADH-IDE-$ARGUMENTS.md` doit etre accessible

## Workflow

### 1. Lire le contrat

- Charger `.openspec/migration/ADH-IDE-$ARGUMENTS.contract.yaml`
- Identifier tous les elements avec status PARTIAL ou MISSING
- Ignorer les N/A (backend) et IMPL (deja fait)

### 2. Prioriser les gaps

| Priorite | Elements |
|----------|---------|
| P1 | Types/interfaces manquants (enrichir `src/types/`) |
| P2 | Logique metier manquante dans les stores |
| P3 | Composants UI incomplets dans les pages |
| P4 | Validations Zod manquantes |
| P5 | Tests pour la logique enrichie |

### 3. Implementer les enrichissements

Pour chaque gap PARTIAL ou MISSING :

1. **Lire la spec** pour comprendre la logique Magic exacte
2. **Lire le code existant** pour comprendre le pattern en place
3. **Enrichir** en respectant les patterns du projet :
   - Types : `adh-web/src/types/*.ts`
   - Stores : `adh-web/src/stores/*.ts` (Zustand)
   - Pages : `adh-web/src/pages/*.tsx`
   - API : `adh-web/src/api/*.ts`
   - Schemas : Zod v4 dans les fichiers `schemas*.ts`

4. **Respecter les patterns existants** :
   - Mock/API dual-mode : `useDataSourceStore.getState().isRealApi`
   - Store pattern : voir `transactionStore.ts`
   - Page pattern : voir `SeparationPage.tsx`
   - Print pattern : voir `FacturePreview.tsx`

### 4. Ecrire les tests

Pour chaque enrichissement :
- Tests unitaires dans `*.test.ts` co-localise
- Pattern AAA (Arrange, Act, Assert)
- Import : `import { describe, it, expect, vi } from 'vitest'`
- Pool : `--pool=vmForks` (WSL2)

### 5. Valider

```bash
cd /mnt/d/Projects/ClubMed/LecteurMagic/adh-web
npx tsc --noEmit
npx vitest run --pool=vmForks
npm run build
```

### 6. Mettre a jour le contrat

- Changer les status PARTIAL → IMPL et MISSING → IMPL
- Recalculer `coverage_pct`
- Mettre `status: enriched`
- Ajouter `enriched_date` et `enriched_files` dans le YAML

## Regles

- **NE PAS casser l'existant** : tsc + tests doivent passer apres chaque enrichissement
- **NE PAS sur-ingenierer** : implementer uniquement ce qui est dans le contrat
- **NE PAS modifier les N/A** : les elements backend restent N/A
- **Preferer enrichir l'existant** : modifier les fichiers existants plutot que creer de nouveaux fichiers
- **Mock data** : fournir des mock data realistes pour le dual-mode

## Exemple

```
/magic-enrich 122    → enrichit SessionOuverturePage + sessionStore + types
/magic-enrich 120    → enrichit DenominationGrid avec breakdown MOP
```
