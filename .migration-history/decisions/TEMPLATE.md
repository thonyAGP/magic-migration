# Decision: [Titre Court]

> **Date**: YYYY-MM-DD
> **Décideur**: [Nom ou "Équipe migration"]
> **Status**: [PROPOSED | ACCEPTED | REJECTED | SUPERSEDED]

---

## Context

[Décrire le contexte et le problème à résoudre]

**Problème**:
- Point 1
- Point 2

**Contraintes**:
- Contrainte technique 1
- Contrainte métier 2

---

## Legacy Pattern

```magic
[Code Magic source qui pose problème]

Exemple:
IF({0,3}='E',Msg('Error'),Update(operation,A,{1,3}))
```

**Analyse**:
- Que fait ce code dans Magic?
- Quels sont les cas d'usage?
- Quelle est la complexité?

---

## Options considérées

### Option 1: [Nom]

**Approche**:
```typescript
// Exemple de code
```

**Avantages**:
- ✅ Avantage 1
- ✅ Avantage 2

**Inconvénients**:
- ❌ Inconvénient 1
- ❌ Inconvénient 2

**Effort**: [LOW | MEDIUM | HIGH]

---

### Option 2: [Nom]

**Approche**:
```typescript
// Exemple de code
```

**Avantages**:
- ✅ Avantage 1

**Inconvénients**:
- ❌ Inconvénient 1

**Effort**: [LOW | MEDIUM | HIGH]

---

## Decision

**Choix**: Option X - [Nom]

**Implémentation**:
```typescript
// Code moderne choisi
```

---

## Why This Way

**Raisons principales**:
1. Raison 1 (la plus importante)
2. Raison 2
3. Raison 3

**Trade-offs acceptés**:
- On sacrifie X pour obtenir Y
- On accepte Z car priorité sur W

**Alternatives rejetées et pourquoi**:
- Option 1: Rejetée car [raison]
- Option 2: Rejetée car [raison]

---

## Test Coverage

**Tests ajoutés**:
- `tests/feature.test.ts:42` - Test du cas nominal
- `tests/feature.test.ts:58` - Test du cas d'erreur

**Coverage**:
- Expressions Magic couvertes: X/Y (Z%)
- Tests unitaires: A tests
- Tests d'intégration: B tests

---

## Applied To

**Programmes migrés avec ce pattern**:
- Prg_48 (ADH-IDE-48) - Saisie Contenu Caisse
- Prg_138 (ADH-IDE-138) - Validation
- Prg_154 (ADH-IDE-154) - Operations

**Fichiers affectés**:
- `adh-web/src/stores/saisieStore.ts`
- `adh-web/src/utils/validation.ts`

---

## References

**Liens**:
- PR: #123
- Issue: #456
- Documentation: [lien]
- Pattern associé: `.migration-history/patterns/if-error-msg.yaml`

**Discussions**:
- Slack thread: [lien]
- Meeting notes: [lien]

---

## Updates

| Date | Change | Reason |
|------|--------|--------|
| YYYY-MM-DD | Initial decision | — |
| YYYY-MM-DD | Updated implementation | [raison du changement] |
