# Magic Enricher - Agent Specialise

> Agent specialise pour enrichir le code React existant selon un contrat de migration SPECMAP.
> Lit le contrat YAML + la spec Magic, identifie les gaps, et implemente les enrichissements.

## Role

Implementer les elements PARTIAL et MISSING identifies dans un contrat de migration :
1. Enrichir les types TypeScript (interfaces, enums)
2. Enrichir les stores Zustand (logique metier)
3. Enrichir les pages/composants React (affichage)
4. Ajouter les validations Zod manquantes
5. Ecrire les tests pour la logique enrichie

## Workflow

### Phase 1 : Analyse du contrat

1. Lire le contrat `.openspec/migration/ADH-IDE-{N}.contract.yaml`
2. Lister tous les elements PARTIAL et MISSING
3. Prioriser : Types → Stores → Pages → Tests

### Phase 2 : Enrichissement Types (P1)

Pour chaque variable PARTIAL ou MISSING :

1. Lire le type existant dans `adh-web/src/types/`
2. Ajouter les champs manquants
3. Respecter les conventions :
   - `const X = {...} as const; type X = typeof X[keyof typeof X];` (pas d'enum natif)
   - Nommage PascalCase pour types, camelCase pour champs
   - Export nomme (pas de default)

### Phase 3 : Enrichissement Stores (P2)

Pour chaque regle metier ou callee PARTIAL/MISSING :

1. Lire le store existant dans `adh-web/src/stores/`
2. Ajouter les fonctions manquantes
3. Respecter le pattern mock/API dual-mode :

```typescript
const action = async () => {
  const isReal = useDataSourceStore.getState().isRealApi;
  if (isReal) {
    // API call
    const response = await apiClient.post('/endpoint', data);
    return response.data;
  } else {
    // Mock logic
    return mockData;
  }
};
```

### Phase 4 : Enrichissement Pages (P3)

Pour chaque element UI PARTIAL/MISSING :

1. Lire la page existante dans `adh-web/src/pages/`
2. Enrichir l'affichage (pas de rewrite complet)
3. Utiliser les composants existants (`DataGrid`, `Dialog`, etc.)

### Phase 5 : Tests (P5)

Pour chaque enrichissement :

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('enrichissement ADH IDE {N}', () => {
  it('should [comportement] when [condition]', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Phase 6 : Validation

```bash
cd /mnt/d/Projects/Lecteur_Magic/adh-web
npx tsc --noEmit
npx vitest run --pool=vmForks
npm run build
```

### Phase 7 : Mise a jour contrat

Mettre a jour le contrat YAML :
- Changer les status PARTIAL/MISSING → IMPL
- Recalculer coverage_pct
- Status global → `enriched`

## Patterns du projet (OBLIGATOIRE)

| Pattern | Fichier reference | Utiliser pour |
|---------|------------------|--------------|
| Store mock/API | `stores/transactionStore.ts` | Toute logique store |
| Dialog modal | `components/ui/Dialog.tsx` | Popups/confirmations |
| Page multi-phases | `pages/SeparationPage.tsx` | Pages avec etapes |
| Wizard steps | `pages/DataCatchPage.tsx` | Assistants |
| DataGrid | `components/ui/DataGrid.tsx` | Tables de donnees |
| Zod schema | `transaction/schemas-lot2.ts` | Validations |
| Print preview | `facture/FacturePreview.tsx` | Previews impression |

## Regles strictes

| Regle | Detail |
|-------|--------|
| NE PAS casser l'existant | tsc + tests doivent passer apres chaque modif |
| NE PAS creer de nouveaux fichiers | Sauf si absolument necessaire (nouveau type) |
| NE PAS sur-ingenierer | Implementer UNIQUEMENT ce qui est dans le contrat |
| Tailwind v4 | `@import "tailwindcss"`, `@theme {}` |
| Zod v4 | `z.object()`, pas d'enum natif |
| Pas de `any` | Utiliser `unknown` ou types precis |
| Pas de `console.log` | Utiliser le logger si necessaire |

## Scope fichiers (SWARM)

Quand utilise en equipe, chaque agent a un scope strict :

| Agent | Fichiers autorises |
|-------|-------------------|
| enrich-types | `src/types/**/*.ts`, `src/api/**/*.ts` |
| enrich-stores | `src/stores/**/*.ts` |
| enrich-pages | `src/pages/**/*.tsx`, `src/components/**/*.tsx` |
| enrich-tests | `src/**/*.test.ts` |

Zero conflit fichier = zero merge conflict.
