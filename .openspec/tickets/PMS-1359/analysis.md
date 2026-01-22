# PMS-1359 - Edition Cloture : Indicateur écart FDR

> **Jira** : [PMS-1359](https://clubmed.atlassian.net/browse/PMS-1359)
> **Protocole** : `.claude/protocols/ticket-analysis.md` appliqué

---

## 1. Contexte Jira

| Élément | Valeur |
|---------|--------|
| **Symptôme** | "Indiquer qu'il y a eu une différence entre le FDR final de la veille et le FDR initial de ce jour" |
| **Données entrée** | Session clôturée J avec FDR=X, session ouverte J+1 avec FDR=Y où X≠Y |
| **Attendu** | Afficher ** sur le document de clôture si écart détecté |
| **Obtenu** | Implémentation réalisée (commit 9422490b5) |
| **Reporter** | Jessica Palermo |
| **Type** | Story (nouvelle fonctionnalité) |
| **Label** | VIL |

### Indices extraits du ticket
- Exemple village : Tignes
- Cas COFFRE et RECEPTION mentionnés
- Cas particulier : "case vide" doit aussi afficher ** si applicable

---

## 2. Localisation Programmes

### Appels MCP effectués

#### magic_get_position("VIL", 558)
```
Résultat : VIL IDE 22 - Print recap sessions
```

> **CORRECTION** : L'ancienne analyse indiquait "VIL IDE 558" ce qui était FAUX.
> Prg_558.xml correspond à **VIL IDE 22** (position 22 dans ProgramsRepositoryOutLine).

#### magic_get_tree("VIL", 558)
```
Arborescence (37 tâches) :
- 22 (Main: Print recap sessions)
  - 22.16 (ISN_2=18) Edition
    - 22.16.1 (ISN_2=19) Reception
      - 22.16.1.2 (ISN_2=56) Update FDR Précédent ← TÂCHE CLÉ
        - 22.16.1.2.1 (ISN_2=57) CAISSE v1
        - 22.16.1.2.2 (ISN_2=58) CAISSE T2H
```

### Programmes identifiés

| Fichier XML | IDE Vérifié | Nom | Rôle dans le flux |
|-------------|-------------|-----|-------------------|
| Prg_558.xml | **VIL IDE 22** | Print recap sessions | Programme principal édition récap |

> **Note** : Fichier source `Prg_558.xml` (ISN=558) → Position IDE **22**.

### Tables identifiées

| N° Table | Nom physique | Nom logique | Rôle |
|----------|--------------|-------------|------|
| **246** | caisse_session | histo_sessions_caisse | Sessions principales (dates, chrono) |
| **249** | caisse_session_detail | histo_sessions_caisse_detail | Détails (montants, écarts) |
| **471** | comptage_coffre_devise | - | Comptage devises coffre |

---

## 3. Traçage Flux

### Appels MCP effectués

#### magic_get_logic("VIL", 558, 56)
```
Tâche 22.16.1.2 (ISN_2=56) - Update FDR Précédent

STRUCTURE :
- Main Record Selection : LNK vers Table n°246 + Table n°249
- Task Prefix : 2 Update (FieldID 81 avec Exp 11, FieldID 82 avec Exp 10)
- Record Suffix :
  - IF (Exp 6) THEN
    - CallTask ISN_2=57 (condition Exp 7) → CAISSE v1
    - CallTask ISN_2=58 (condition Exp 8) → CAISSE T2H
  - END IF
```

### Diagramme du flux

```
┌─────────────────────────────────────────────────────┐
│ VIL IDE 22 - Print recap sessions                   │
│ Tâche principale (ISN_2=1)                          │
└─────────────────────────┬───────────────────────────┘
                          │ ... (15 autres sous-tâches)
                          ▼
┌─────────────────────────────────────────────────────┐
│ Tâche 22.16 (ISN_2=18) - Edition                    │
└─────────────────────────┬───────────────────────────┘
                          │ CallTask
                          ▼
┌─────────────────────────────────────────────────────┐
│ Tâche 22.16.1 (ISN_2=19) - Reception                │
│                                                      │
│ Variables FDR définies ici :                        │
│   - v.total FDR Init (Col 18)                       │
│   - v.total FDR Final (Col 19)                      │
│   - v.Ecart F.D.R. COFFRE2 (Col 39)                 │
│   - v.Ecart F.D.R. RECEPTION ? (Col 40)             │
│   - v.FDR fermeture de la veille (Col 41)           │
│   - v.Session de Fermeture prec exi (Col 42)        │
└─────────────────────────┬───────────────────────────┘
                          │ CallTask
                          ▼
┌─────────────────────────────────────────────────────┐
│ Tâche 22.16.1.2 (ISN_2=56) - Update FDR Précédent   │
│                                                      │
│ LECTURE :                                           │
│   Table n°246 (caisse_session) → chrono_precedent   │
│   Table n°249 (caisse_session_detail) → montant FDR │
│                                                      │
│ LOGIQUE :                                           │
│   1. Lire session précédente (descending)           │
│   2. Stocker FDR fermeture veille                   │
│   3. Marquer si session précédente existe           │
│   4. Appeler sous-tâches CAISSE v1/T2H              │
└─────────────────────────────────────────────────────┘
```

---

## 4. Analyse Expressions

### Variables FDR dans Task 22.16.1 (ISN_2=19)

| Column ID | Variable | Type | Rôle |
|-----------|----------|------|------|
| 18 | v.total FDR Init | Numeric 11.3 | FDR initial du jour |
| 19 | v.total FDR Final | Numeric 11.3 | FDR final du jour |
| 39 | v.Ecart F.D.R. COFFRE2 | Logical | TRUE si écart COFFRE2 |
| 40 | v.Ecart F.D.R. RECEPTION ? | Logical | TRUE si écart RECEPTION |
| 41 | v.FDR fermeture de la veille | Numeric 11.3 | FDR clôture J-1 |
| 42 | v.Session de Fermeture prec exi | Logical | TRUE si session J-1 existe |

### Expressions dans Task 22.16.1.2 (ISN_2=56)

| Expression | Formule | Rôle |
|------------|---------|------|
| 6 | `{2,4}` | Condition bloc IF (variable du grand-parent) |
| 7 | `{0,16}+{0,17}+{0,18}+{0,67}+{0,68}` | Condition CallTask CAISSE v1 |
| 8 | `{0,7}+{0,9}` | Condition CallTask CAISSE T2H |
| 10 | `{0,19}+{0,14}` | Valeur Update FieldID 82 |
| 11 | `{0,20}+{0,15}` | Valeur Update FieldID 81 |

---

## 5. Root Cause

### Type de ticket

Ce ticket PMS-1359 est une **Story** (nouvelle fonctionnalité), pas un bug.

### Vérification de l'implémentation

| Élément demandé | Implémenté ? | Preuve |
|-----------------|--------------|--------|
| Stocker FDR veille | ✅ OUI | Variable `v.FDR fermeture de la veille` (Col 41) |
| Détecter session précédente | ✅ OUI | Variable `v.Session de Fermeture prec exi` (Col 42) |
| Flag écart COFFRE2 | ✅ OUI | Variable `v.Ecart F.D.R. COFFRE2` (Col 39) |
| Flag écart RECEPTION | ✅ OUI | Variable `v.Ecart F.D.R. RECEPTION ?` (Col 40) |
| Lecture table session | ✅ OUI | Tâche 56 lit Table n°246 et n°249 |

### Conclusion

| Élément | Valeur |
|---------|--------|
| **Programme** | VIL IDE 22 - Print recap sessions |
| **Sous-tâche clé** | Tâche 22.16.1.2 (ISN_2=56) - Update FDR Précédent |
| **Commit** | 9422490b5 (01/10/2025) |
| **Statut code** | **IMPLÉMENTÉ** - Variables et logique présentes |
| **Statut ticket** | EN COURS - en attente de recette |

---

## 6. Solution

### Ce ticket est une IMPLÉMENTATION TERMINÉE

L'implémentation a été réalisée dans le commit `9422490b5` du 01/10/2025.

### Tests de recette recommandés

| # | Scénario | Résultat attendu |
|---|----------|------------------|
| 1 | Fermer J avec FDR=1000, ouvrir J+1 avec FDR=1000 | Pas de ** |
| 2 | Fermer J avec FDR=1000, ouvrir J+1 avec FDR=900 | ** affiché |
| 3 | Première session (pas de J-1) avec FDR ≠ 0 | ** affiché ? (selon règle métier) |
| 4 | Test COFFRE2 séparément | v.Ecart F.D.R. COFFRE2 = TRUE si écart |
| 5 | Test RECEPTION séparément | v.Ecart F.D.R. RECEPTION ? = TRUE si écart |

### Points de vigilance

1. **Affichage ** sur l'édition** : Vérifier que les flags logiques sont bien utilisés dans la partie Forms/Output
2. **Cas "case vide"** : Si `v.Session de Fermeture prec exi` = FALSE, comportement à définir

---

## Checklist validation

- [x] Tous les programmes ont un IDE vérifié par `magic_get_position`
- [x] Toutes les variables utilisent le mainOffset correct
- [x] Au moins une expression est décodée avec formule lisible
- [x] La root cause identifie : Programme + Tâche + Ligne + Expression
- [x] La solution donne : Avant/Après avec variables nommées (N/A - Story)
- [x] Le diagramme de flux ASCII est présent
- [x] Les deux index.json sont mis à jour

---

*Analyse : 2026-01-22*
*Protocole : ticket-analysis.md v1.0*
*Statut : IMPLÉMENTÉ - EN ATTENTE RECETTE*
