# Decision: Operation Type Representation Strategy

> **Date**: 2026-02-24
> **Décideur**: Équipe migration
> **Status**: ACCEPTED

---

## Context

Lors de la migration des programmes de caisse (Prg_48, Prg_138, Prg_154), nous avons identifié le pattern récurrent `P. O/T/F [A]='X'` qui vérifie le type d'opération (Opening/Transfer/Fund).

**Problème**:
- Magic utilise des codes single-letter ('O', 'T', 'F') pour économiser la mémoire
- TypeScript/React offrent plusieurs options pour représenter ces types
- Besoin de cohérence entre tous les programmes migrés

**Contraintes**:
- Doit être type-safe (compile-time checking)
- Compatible avec le backend (peut utiliser les mêmes codes en DB)
- Lisible et maintenable pour nouveaux développeurs
- Performance acceptable (comparaisons fréquentes)

---

## Legacy Pattern

```magic
# Magic Unipaas - Programme 48, Task 2, Ligne 12
IF(P. O/T/F [A]='O',
  # Opening operation
  Update(...),
  IF(P. O/T/F [A]='T',
    # Transfer operation
    Update(...),
    IF(P. O/T/F [A]='F',
      # Fund operation
      Update(...),
      Msg('Invalid operation type')
    )
  )
)
```

**Analyse**:
- 3 types d'opérations: Opening ('O'), Transfer ('T'), Fund ('F')
- Utilisé dans 3 programmes (10+ occurrences totales)
- Validation requise car type peut venir de l'utilisateur
- Besoin de mapping vers formulaires React

---

## Options considérées

### Option 1: Keep Magic Codes (Union Type)

**Approche**:
```typescript
type OperationType = 'O' | 'T' | 'F';

interface Operation {
  type: OperationType;
  // ... other fields
}

if (operation.type === 'O') {
  // Handle opening
}
```

**Avantages**:
- ✅ Compatible avec la base de données (même format)
- ✅ Compact (1 byte par type)
- ✅ Migration directe sans mapping
- ✅ Performance optimale

**Inconvénients**:
- ❌ Pas auto-documenté (besoin de comments)
- ❌ Codes cryptiques pour nouveaux devs
- ❌ Difficile à comprendre dans les logs

**Effort**: LOW

---

### Option 2: Descriptive Strings

**Approche**:
```typescript
type OperationType = 'opening' | 'transfer' | 'fund';

interface Operation {
  type: OperationType;
}

if (operation.type === 'opening') {
  // Handle opening
}
```

**Avantages**:
- ✅ Auto-documenté et lisible
- ✅ Facile à comprendre pour nouveaux devs
- ✅ Meilleur dans les logs
- ✅ Type-safe avec union type

**Inconvénients**:
- ❌ Besoin de mapping si DB utilise codes Magic
- ❌ Strings plus longs (potentiel impact JSON size)
- ❌ Divergence entre frontend et backend

**Effort**: MEDIUM (mapping layer nécessaire)

---

### Option 3: Enum with Magic Codes

**Approche**:
```typescript
enum OperationType {
  OPENING = 'O',
  TRANSFER = 'T',
  FUND = 'F',
}

interface Operation {
  type: OperationType;
}

if (operation.type === OperationType.OPENING) {
  // Handle opening
}
```

**Avantages**:
- ✅ Best of both worlds: lisible ET compatible DB
- ✅ Auto-completion dans l'IDE
- ✅ Type-safe compile-time
- ✅ Documentation intégrée
- ✅ Refactoring-friendly

**Inconvénients**:
- ❌ Légèrement plus verbeux
- ❌ Besoin d'import de l'enum
- ❌ Compiled to object (small bundle overhead)

**Effort**: LOW

---

## Decision

**Choix**: Option 3 - Enum with Magic Codes

**Implémentation**:
```typescript
// adh-web/src/types/operation.ts
export enum OperationType {
  OPENING = 'O',
  TRANSFER = 'T',
  FUND = 'F',
}

export interface Operation {
  id: string;
  type: OperationType;
  amount: number;
  date: Date;
  // ... other fields
}

// Validation helper
export const VALID_OPERATION_TYPES = Object.values(OperationType);

export function validateOperationType(type: string): type is OperationType {
  return VALID_OPERATION_TYPES.includes(type as OperationType);
}

// Usage in store
import { OperationType } from '@/types/operation';

if (operation.type === OperationType.OPENING) {
  // Opening-specific logic
  await handleOpeningOperation(operation);
}
```

---

## Why This Way

**Raisons principales**:
1. **Compatibilité DB** - Garde les codes Magic ('O', 'T', 'F') pour le backend, évite mapping layer
2. **Lisibilité code** - `OperationType.OPENING` est auto-documenté vs `'O'` qui nécessite contexte
3. **Type safety** - Compile-time checking + auto-completion IDE
4. **Maintenance** - Centralisé dans un seul fichier, facile à étendre si nouveaux types
5. **Logs et debugging** - Enum values affichent `OperationType.OPENING` dans console/debugger

**Trade-offs acceptés**:
- On sacrifie la simplicité du string literal pour la robustesse de l'enum
- On accepte un import supplémentaire pour meilleure auto-completion

**Alternatives rejetées et pourquoi**:
- **Option 1 (Union type 'O' | 'T' | 'F')**: Rejetée car codes non auto-documentés, difficile pour onboarding
- **Option 2 (Descriptive strings)**: Rejetée car nécessite mapping layer vers DB, divergence frontend/backend

---

## Test Coverage

**Tests ajoutés**:
- `adh-web/src/__tests__/operationType.test.ts:12` - Validate all enum values
- `adh-web/src/__tests__/operationType.test.ts:24` - Reject invalid types
- `adh-web/src/__tests__/saisieContenuCaisseStore.test.ts:28` - Opening operation
- `adh-web/src/__tests__/saisieContenuCaisseStore.test.ts:45` - Transfer operation
- `adh-web/src/__tests__/saisieContenuCaisseStore.test.ts:62` - Fund operation

**Coverage**:
- Expressions Magic couvertes: 10/10 (100%)
- Tests unitaires: 15 tests
- Tests d'intégration: 3 tests (un par type)

---

## Applied To

**Programmes migrés avec ce pattern**:
- Prg_48 (ADH-IDE-48) - Saisie Contenu Caisse
- Prg_138 (ADH-IDE-138) - Validation
- Prg_154 (ADH-IDE-154) - Operations

**Fichiers affectés**:
- `adh-web/src/types/operation.ts` (enum definition)
- `adh-web/src/stores/saisieContenuCaisseStore.ts` (usage)
- `adh-web/src/stores/validationStore.ts` (usage)
- `adh-web/src/__tests__/*.test.ts` (coverage)

**Expressions tracées**:
- `Prg_48:Task_2:Line_12:Expr_30` - P. O/T/F [A]='O'
- `Prg_48:Task_2:Line_20:Expr_60` - P. O/T/F [A]='T'
- `Prg_48:Task_2:Line_22:Expr_65` - P. O/T/F [A]='F'
- (+ 7 autres occurrences dans Prg_138/154)

---

## References

**Liens**:
- Pattern associé: `.migration-history/patterns/operation-type-check.yaml`
- Contract: `.openspec/migration/ADH/ADH-IDE-48.contract.yaml`
- TypeScript Enum best practices: https://www.typescriptlang.org/docs/handbook/enums.html

**Discussions**:
- Initial pattern discovery during Prg_48 enrichment (2026-02-24)

---

## Updates

| Date | Change | Reason |
|------|--------|--------|
| 2026-02-24 | Initial decision | Pattern identified across 3 programs |
