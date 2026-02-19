---
description: Generate a SPECMAP migration contract for a Magic program
arguments:
  - name: program_id
    description: "IDE number of the program (e.g. 122)"
    required: true
---

# Generation contrat de migration SPECMAP

Genere un contrat de migration YAML pour le programme ADH IDE $ARGUMENTS.

## Prerequis

- Le fichier `.openspec/specs/ADH-IDE-$ARGUMENTS.md` doit exister
- Le dossier `.openspec/migration/` doit exister
- Le code React dans `adh-web/src/` est le code cible

## Etapes SPECMAP

### Etape 1 : EXTRACT

1. **Lire la spec** `.openspec/specs/ADH-IDE-$ARGUMENTS.md`
2. Extraire :
   - **Fiche d'identite** (section 1) : nom, complexite, taches, tables, callees
   - **Regles metier** (section 5) : chaque RM-XXX avec condition, variables, expression
   - **Contexte** (section 6) : callers, callees
   - **Variables importantes** (section Donnees/TAB:Donnees) : lettre, nom, type
   - **Tables** (section Donnees) : nom, mode (R/W/L), colonnes
   - **Callees detail** (section 13.4) : IDE, nom, nb appels, contexte

### Etape 2 : MAP

Pour chaque construct Magic extrait, determiner la cible React :

| Construct Magic | Cible React/TS |
|----------------|---------------|
| Ecran (Form) | Page/Component `.tsx` |
| Table WRITE | API endpoint (backend) |
| Table READ | API call + type TS |
| Variable locale calcul | Variable TS dans store/page |
| Variable parametre | Props ou params |
| Regle metier (condition) | Validation Zod ou logique store |
| CallTask (sous-programme) | Fonction dans store ou composant |
| Expression calcul | Fonction pure TS |
| Print/Ticket | PrintService call |
| WebService call | API call (N/A frontend) |

### Etape 3 : GAP

Pour chaque element mappe :

1. **Scanner le code React** dans `adh-web/src/`
   - Grep pour le nom du concept (ex: "ouverture", "ecart", "solde initial")
   - Grep pour le callee (ex: IDE 126 → "calculateSoldeInitial", "solde")
   - Grep pour les variables (ex: "monnaie", "produits", "cartes", "cheques")

2. **Classifier chaque element** :
   | Status | Definition |
   |--------|-----------|
   | IMPL | Implementation complete et fidele a la spec |
   | PARTIAL | Existe mais simplifie ou incomplet |
   | MISSING | Aucun equivalent dans le code React |
   | MOCK-ONLY | Existe mais uniquement avec donnees mock statiques |
   | N/A | Backend-only (WebService, table WRITE, batch) |

### Etape 4 : CONTRACT

Produire le fichier `.openspec/migration/ADH-IDE-$ARGUMENTS.contract.yaml` :

```yaml
# SPECMAP Migration Contract
# Generated: [date]
# Program: ADH IDE $ARGUMENTS - [Nom]

program:
  id: $ARGUMENTS
  name: "[Nom]"
  complexity: "[BASSE|MOYENNE|HAUTE]"
  callers: [list of caller IDE numbers]
  callees: [list of callee IDE numbers]
  tasks_count: N
  tables_count: N
  expressions_count: N

rules:
  - id: RM-001
    description: "[Description de la regle]"
    condition: "[Condition Magic decodee]"
    variables: ["[lettre] ([nom])"]
    status: IMPL | PARTIAL | MISSING | N/A
    target_file: "src/[path]"
    gap_notes: "[Explication du gap]"

variables:
  - letter: "[X]"
    name: "[Nom variable]"
    type: "[Real|Virtual|Parameter]"
    status: IMPL | PARTIAL | MISSING | N/A
    target_file: "src/[path]"
    gap_notes: "[Explication]"

tables:
  - id: N
    name: "[Nom table]"
    mode: "R|W|L"
    status: IMPL | PARTIAL | MISSING | N/A
    target_file: "src/[path]"
    gap_notes: "[Explication]"

callees:
  - ide: N
    name: "[Nom programme]"
    calls: N
    context: "[Contexte d'appel]"
    status: IMPL | PARTIAL | MISSING | N/A
    target: "[fonction/composant cible]"
    gap_notes: "[Explication]"

overall:
  rules_total: N
  rules_impl: N
  rules_partial: N
  rules_missing: N
  rules_na: N
  variables_key_count: N
  callees_total: N
  callees_impl: N
  callees_missing: N
  coverage_pct: N
  status: contracted
  generated: "[date ISO]"
  notes: "[observations]"
```

## Regles

- **Format IDE** : utiliser `ADH IDE N - Nom` partout, jamais `Prg_N`
- **Variables** : utiliser la lettre IDE (A-Z, AA-AZ, etc.), pas FieldXXX
- **Callees N/A** : les WebService calls (WS) sont N/A cote frontend
- **Coverage** : calculer uniquement sur les elements non-N/A
  - `coverage_pct = (impl + partial*0.5) / (total - na) * 100`
- **Si la spec est absente** : signaler et arreter
- **Si le code React est absent** : tout est MISSING

## Exemples

```
/magic-contract 122    → contrat pour Ouverture caisse
/magic-contract 120    → contrat pour Saisie contenu caisse
/magic-contract 237    → contrat pour Vente GP
```
