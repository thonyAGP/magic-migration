---
description: Verify a SPECMAP migration contract is fully implemented
arguments:
  - name: program_id
    description: "IDE number of the program (e.g. 122)"
    required: true
---

# Verification contrat de migration SPECMAP

Verifie que le contrat pour ADH IDE $ARGUMENTS est completement implemente.

## Prerequis

- Le contrat `.openspec/migration/ADH-IDE-$ARGUMENTS.contract.yaml` doit exister
- Le contrat doit avoir status `enriched`

## Workflow

### 1. Charger le contrat et la spec

- Lire le contrat YAML
- Lire la spec `.openspec/specs/ADH-IDE-$ARGUMENTS.md`

### 2. Pour chaque element non-N/A

Verifier dans le code React :

| Element | Verification |
|---------|-------------|
| Regle metier (RM-XXX) | La condition est implementee fidelement |
| Variable cle | Le type TS inclut ce champ |
| Callee IMPL | La fonction existe et est appelee |
| Callee PARTIAL | Verifier si la simplification est acceptable |

### 3. Verification technique

```bash
cd /mnt/d/Projects/Lecteur_Magic/adh-web
npx tsc --noEmit          # 0 erreurs
npx vitest run --pool=vmForks  # tous passent
npm run build             # build OK
```

### 4. Produire le rapport

```
=== Verification ADH IDE $ARGUMENTS ===

| Element | Status contrat | Verification | OK? |
|---------|---------------|-------------|-----|
| RM-001 | IMPL | Condition presente dans store | OK |
| RM-002 | IMPL | Validation Zod conforme | OK |
| Callee 120 | PARTIAL | Simplifie mais acceptable | WARN |
| ... | ... | ... | ... |

Resultat: VERIFIED (12/14 OK, 2 WARN, 0 FAIL)
tsc: 0 erreurs
tests: 45 passed
build: OK
```

### 5. Mettre a jour le contrat

Si tout est OK ou WARN :
- Status → `verified`
- Ajouter `verified_date`
- Ajouter `verification_notes`

Si FAIL :
- Lister les elements en echec
- Recommander les corrections
- NE PAS changer le status

## Regles

- **READ-ONLY sauf contrat** : ne modifier aucun fichier de code
- **Fidele a la spec** : comparer avec la spec Magic, pas juste les tests
- **WARN acceptable** : simplification deliberee documentee = OK
- **FAIL bloquant** : logique absente ou incorrecte = contrat reste `enriched`
