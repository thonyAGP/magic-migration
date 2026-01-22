# PMS-1359 - Analyse Technique Detaillee

> **Jira** : [PMS-1359](https://clubmed.atlassian.net/browse/PMS-1359)
> **Protocole** : `.claude/protocols/ticket-analysis.md` applique
> **Date analyse** : 2026-01-22

---

## 1. Contexte Jira

### Informations ticket

| Element | Valeur |
|---------|--------|
| **Titre** | Edition Cloture (suite) |
| **Type** | Story (nouvelle fonctionnalite) |
| **Statut Jira** | En cours |
| **Priorite** | Basse |
| **Reporter** | Jessica Palermo |
| **Assignee** | Anthony Leberre |
| **Label** | VIL |
| **Cree le** | 2025-08-26 |
| **Mis a jour** | 2026-01-22 |

### Description originale (citation)

> "En se basant sur le ticket il faudrait faire la meme chose afin d'indiquer qu'il y a eu une difference entre le FDR final de la veille et le FDR initial de ce jour."
>
> "Voici un ex de Tignes : Le 20/08 le coffre 1 ferme avec [IMAGE] et le lendemain il ouvre [IMAGE]. Il faudrait mettre ** sur le document qui arrive ce jour dans la colonne FDR initial afin de prevenir que le montant de fermeture de la veille etait different de celui ci."
>
> "Il se peut que la case soit vide, il faudra donc avoir quand meme les **"

### Extraction des indices

| Indice | Valeur | Interpretation |
|--------|--------|----------------|
| Village exemple | Tignes | Village ski avec coffres multiples |
| Date exemple | 20/08 | Saison ete |
| Elements cites | COFFRE, RECEPTION | Deux types de postes concernes |
| Marqueur demande | `**` | Indicateur visuel d'ecart |
| Cas special | "case vide" | Gerer l'absence de donnees |

---

## 2. Localisation Programmes

### Appel MCP : magic_get_position("VIL", 558)

**Commande executee** :
```
magic_get_position(project="VIL", programId=558)
```

**Resultat** :
| Parametre | Valeur |
|-----------|--------|
| Projet | VIL |
| Program ID (XML) | 558 |
| **Position IDE** | **22** |
| **Nom** | **Print recap sessions** |

**Reference complete** : **VIL IDE 22 - Print recap sessions**

> **IMPORTANT** : Le fichier source est `Prg_558.xml` (ISN=558) mais dans l'IDE Magic, ce programme apparait en position **22**. Ne JAMAIS confondre ISN et position IDE.

### Appel MCP : magic_get_tree("VIL", 558)

**Commande executee** :
```
magic_get_tree(project="VIL", programId=558)
```

**Resultat** : Arborescence de 37 taches sur 4 niveaux.

**Extrait pertinent pour ce ticket** :
```
VIL IDE 22 (Main: Print recap sessions)
├── 22.1-22.15 ... (autres sous-taches)
├── 22.16 (ISN_2=18) Edition
│   └── 22.16.1 (ISN_2=19) Reception
│       ├── 22.16.1.1 (ISN_2=55) ...
│       └── 22.16.1.2 (ISN_2=56) Update FDR Precedent  <-- TACHE CLE
│           ├── 22.16.1.2.1 (ISN_2=57) CAISSE v1
│           └── 22.16.1.2.2 (ISN_2=58) CAISSE T2H
└── 22.17-22.37 ... (autres sous-taches)
```

### Programmes identifies

| Fichier XML | IDE Verifie | Nom | Role dans le flux |
|-------------|-------------|-----|-------------------|
| Prg_558.xml | **VIL IDE 22** | Print recap sessions | Programme principal edition recap |

> **Note methodologique** : Fichier source `Prg_558.xml` (ISN=558) correspond a la position IDE **22** dans l'arborescence VIL.

---

## 3. Tables Identifiees

### Appel MCP : magic_get_table (implicite via logic)

| N° Table | Nom physique | Nom logique | Cle | Role |
|----------|--------------|-------------|-----|------|
| **246** | caisse_session | histo_sessions_caisse | Key 1 | Sessions principales (dates, chrono, utilisateur) |
| **249** | caisse_session_detail | histo_sessions_caisse_detail | Key 1, SortType=22 | Details montants (FDR, ecarts) |
| **471** | comptage_coffre_devise | %club_user%_caisse_coffre_compcais_devise | - | Comptage devises coffre (source principale) |

### Relations entre tables

```
Table 471 (comptage_coffre_devise)
    │
    │ MAIN SOURCE
    ▼
┌──────────────────────────────────────────────────┐
│ Tache 22.16.1.2 - Update FDR Precedent           │
│                                                   │
│  LINK → Table 246 (caisse_session)               │
│         - Filtre: utilisateur, chrono-1, date    │
│         - Recupere: session precedente           │
│                                                   │
│  LINK → Table 249 (caisse_session_detail)        │
│         - Filtre: utilisateur, chrono-1, type='F'│
│         - Recupere: montant FDR fermeture        │
└──────────────────────────────────────────────────┘
```

---

## 4. Tracage Flux

### Appel MCP : magic_get_logic("VIL", 558, 56)

**Commande executee** :
```
magic_get_logic(project="VIL", programId=558, taskIsn2=56)
```

**Resultat** : Tache 22.16.1.2 (ISN_2=56) - "Update FDR Precedent"

### Logic Unit 1 : Record Main (Handler M - Level R)

**Condition globale** : Expression 89

| Ligne | Operation | Details |
|-------|-----------|---------|
| 1 | DATAVIEW_SRC | Main source (Table 471), Type=M, Index 3 |
| 2 | Remark | "On va selectionner l'utilisateur que l'on traite" |
| 3 | Select | FieldID=1, Column 1, Range=Exp 9 |
| 4 | Remark | "lecture descending" |
| 5 | Select | FieldID=2, Column 2, "chrono en cours" |
| 6 | Select | FieldID=3, Column 7, Range=Exp 1 |
| 7 | Remark | " " |
| 8 | **Link** | Table n°246, Key 1, Mode=Read, Direction=Ascending |
| 9 | Select | FieldID=4, Column 1, Locate=Exp 2 |
| 10 | Select | FieldID=5, Column 2, "chrono_precedent", Locate=Exp 3 |
| 11 | Select | FieldID=6, Column 7 |
| 12 | END_LINK | Fin Link table 246 |
| 13-14 | Remark | "On remontera ici que l'on a bien trouve une session precedente..." |
| 15 | **Link** | Table n°249, Key 1, Mode=Read, SortType=22 |
| 16 | Select | FieldID=7, Column 1, Locate=Exp 2 |
| 17 | Select | FieldID=8, Column 2, Locate=Exp 3 |
| 18 | Select | FieldID=9, Column 3 |
| 19 | Select | FieldID=10, Column 4, Locate=Exp 4 |
| 20 | Select | FieldID=11, Column 5, Locate=Exp 5 |
| 21 | Select | FieldID=12, Column 8 |
| 22 | END_LINK | Fin Link table 249 |

### Logic Unit 2 : Task Prefix (Handler P - Level T)

**Condition** : Expression 89

| Ligne | Operation | Details |
|-------|-----------|---------|
| 1 | **Update** | Parent=1, FieldID=81, WithValue=Exp 11, Forced=Yes |
| 2 | **Update** | Parent=1, FieldID=82, WithValue=Exp 10, Forced=Yes |

> Ces Update remontent des valeurs calculees vers la tache parente (22.16.1).

### Logic Unit 3 : Record Suffix (Handler S - Level R)

**Condition** : Expression 89

| Ligne | Operation | Details |
|-------|-----------|---------|
| 1 | **BLOCK IF** | Condition=Exp 6, EndBlock=ligne 5 |
| 2 | **Call Task** | ISN_2=57 (CAISSE v1), Lock=Yes, Wait=Yes, Condition=Exp 7 |
| 3 | **Call Task** | ISN_2=58 (CAISSE T2H), Lock=No, Wait=Yes, Condition=Exp 8 |
| 4 | Remark | (separateur) |
| 5 | **END_BLK** | Fin bloc IF |

### Diagramme du flux complet

```
┌─────────────────────────────────────────────────────────────────────────┐
│ VIL IDE 22 - Print recap sessions                                        │
│ Programme principal d'edition des recapitulatifs de sessions             │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                    ... (15 autres sous-taches) ...
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Tache 22.16 (ISN_2=18) - Edition                                         │
│ Sous-tache gerant la partie edition du recap                             │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ CallTask
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Tache 22.16.1 (ISN_2=19) - Reception                                     │
│                                                                          │
│ VARIABLES FDR DEFINIES ICI :                                             │
│   - Col 18 : v.total FDR Init (Numeric 11.3)                            │
│   - Col 19 : v.total FDR Final (Numeric 11.3)                           │
│   - Col 39 : v.Ecart F.D.R. COFFRE2 (Logical)                           │
│   - Col 40 : v.Ecart F.D.R. RECEPTION ? (Logical)                       │
│   - Col 41 : v.FDR fermeture de la veille (Numeric 11.3)                │
│   - Col 42 : v.Session de Fermeture prec exi (Logical)                  │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ CallTask
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Tache 22.16.1.2 (ISN_2=56) - Update FDR Precedent                        │
│ ══════════════════════════════════════════════════                       │
│                                                                          │
│ RECORD MAIN :                                                            │
│   Source: Table 471 (comptage_coffre_devise)                            │
│   Link → Table 246 (caisse_session) : chrono_precedent                  │
│   Link → Table 249 (caisse_session_detail) : montant FDR                │
│                                                                          │
│ TASK PREFIX :                                                            │
│   Update FieldID 81 ← Expression 11                                      │
│   Update FieldID 82 ← Expression 10                                      │
│                                                                          │
│ RECORD SUFFIX :                                                          │
│   IF (Exp 6) THEN                                                        │
│     CallTask 57 si NOT VG.25 (CAISSE v1)                                │
│     CallTask 58 si NOT VG.39 (CAISSE T2H)                               │
│   END IF                                                                 │
└───────────────────────────────────┬─────────────────────────────────────┘
                          ┌─────────┴─────────┐
                          ▼                   ▼
            ┌─────────────────────┐ ┌─────────────────────┐
            │ Tache 22.16.1.2.1   │ │ Tache 22.16.1.2.2   │
            │ (ISN_2=57)          │ │ (ISN_2=58)          │
            │ CAISSE v1           │ │ CAISSE T2H          │
            └─────────────────────┘ └─────────────────────┘
```

---

## 5. Analyse Expressions

### Expressions de la tache 22.16.1.2 (ISN_2=56)

| ID Exp | Formule brute | Type | Description |
|--------|---------------|------|-------------|
| 1 | `{3,1}` | Date | Reference colonne 1 niveau 3 (date courante) |
| 2 | `{0,1}` | User | Variable utilisateur |
| 3 | `{0,2}-1` | Numeric | Chrono courant - 1 = chrono precedent |
| 4 | `'F'` | Alpha | Constante "F" (Fermeture) |
| 5 | `'F'` | Alpha | Constante "F" (Fermeture) |
| 6 | `{0,12}<>0` | Boolean | Variable 12 differente de 0 → donnees trouvees |
| 7 | `NOT {32768,25}` | Boolean | Negation VG.25 → condition CAISSE v1 |
| 8 | `NOT {32768,39}` | Boolean | Negation VG.39 → condition CAISSE T2H |
| 9 | `{32768,39}` | Boolean | Variable globale 39 |
| 10 | `IF(Trim({1,2})='COFFRE 2',Str({3,2},'3P0'),Trim({1,2}))` | Alpha | Formatage conditionnel |
| 11 | `'FALSE'LOG` | Boolean | Constante FALSE |
| 89 | (non documentee) | Boolean | Condition globale des handlers |

### Decodage des references {niveau, colonne}

| Reference | Niveau | Signification |
|-----------|--------|---------------|
| `{0,X}` | 0 | Variable locale de la tache courante |
| `{1,X}` | 1 | Variable du parent (22.16.1) |
| `{2,X}` | 2 | Variable du grand-parent (22.16) |
| `{3,X}` | 3 | Variable de l'arriere-grand-parent (22) |
| `{32768,X}` | 32768 | Variable globale Main (VG.) |

### Variables FDR dans la tache parente 22.16.1 (ISN_2=19)

| Col ID | Variable | Type | Role |
|--------|----------|------|------|
| 18 | v.total FDR Init | Numeric 11.3 | FDR initial du jour |
| 19 | v.total FDR Final | Numeric 11.3 | FDR final du jour |
| 39 | v.Ecart F.D.R. COFFRE2 | Logical | TRUE si ecart detecte sur COFFRE2 |
| 40 | v.Ecart F.D.R. RECEPTION ? | Logical | TRUE si ecart detecte sur RECEPTION |
| 41 | v.FDR fermeture de la veille | Numeric 11.3 | Montant FDR cloture J-1 |
| 42 | v.Session de Fermeture prec exi | Logical | TRUE si session J-1 existe |

---

## 6. Verification Implementation

### Elements demandes vs implementes

| Element demande | Implemente ? | Preuve | Localisation |
|-----------------|--------------|--------|--------------|
| Stocker FDR veille | OUI | Variable `v.FDR fermeture de la veille` | Col 41, Tache 22.16.1 |
| Detecter session precedente | OUI | Variable `v.Session de Fermeture prec exi` | Col 42, Tache 22.16.1 |
| Flag ecart COFFRE2 | OUI | Variable `v.Ecart F.D.R. COFFRE2` | Col 39, Tache 22.16.1 |
| Flag ecart RECEPTION | OUI | Variable `v.Ecart F.D.R. RECEPTION ?` | Col 40, Tache 22.16.1 |
| Lecture session J-1 | OUI | Link Table 246 avec chrono-1 | Tache 22.16.1.2 ligne 8-12 |
| Lecture montant FDR | OUI | Link Table 249 avec type='F' | Tache 22.16.1.2 ligne 15-22 |

### Commit reference

- **Hash** : `9422490b5`
- **Date** : 01/10/2025
- **Auteur** : (non disponible)

---

## 7. Checklist Validation Protocole

- [x] Tous les programmes ont un IDE verifie par `magic_get_position`
- [x] Les tables sont identifiees avec leurs numeros
- [x] Au moins une expression est decodee avec formule lisible
- [x] La localisation identifie : Programme + Tache + Ligne
- [x] Le diagramme de flux ASCII est present
- [x] Les deux index.json sont a jour

---

*Analyse realisee le 2026-01-22*
*Protocole : ticket-analysis.md v1.0*
