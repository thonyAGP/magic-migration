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

**Resultat** : Arborescence de 38 taches sur 5 niveaux (0 a 4).

**Structure complete niveau 1** (16 sous-taches directes) :
```
VIL IDE 22 (Main: Print recap sessions)
├── 22.1  Telecollectes TPE auto v1
├── 22.2  Telecollectes TPE auto T2H
├── 22.3  Recap Change vente
├── 22.4  Update FDR
├── 22.5  Lecture 18 v1
├── 22.6  Lecture 18 T2H
├── 22.7  Lecture Ventes v1
├── 22.8  Lecture Ventes T2H
├── 22.9  Telecollectes v1
├── 22.10 Telecollectes T2H
├── 22.11 Recap OD
├── 22.12 Recap Change achat
├── 22.13 Recap Ecarts
├── 22.14 Comptage Reception
├── 22.15 PC Coffre 1
└── 22.16 Edition  <-- BRANCHE CONCERNEE
```

**Extrait branche 22.16 (Edition)** :
```
22.16 (ISN_2=18) Edition
└── 22.16.1 (ISN_2=19) Reception
    ├── 22.16.1.1 (ISN_2=56) Update FDR Precedent  <-- TACHE CLE
    │   ├── 22.16.1.1.1 (ISN_2=57) CAISSE v1
    │   └── 22.16.1.1.2 (ISN_2=58) CAISSE T2H
    └── 22.16.1.1 (ISN_2=20) Telecollecte
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
│ Tache 22.16.1.1 - Update FDR Precedent           │
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

**Resultat** : Tache 22.16.1.1 (ISN_2=56) - "Update FDR Precedent"

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

| Ligne | Operation | Variable | Details |
|-------|-----------|----------|---------|
| 2 | **Update** | **EU** (v.FDR fermeture de la veille) | With: Exp 11 = `0` (valeur 0), Forced=Yes |
| 3 | **Update** | **EV** (v.Session de Fermeture prec exi) | With: Exp 10 = `'FALSE'LOG` (FALSE), Forced=Yes |

> Ces Update initialisent les variables EU et EV de la tache parente (22.16.1) a des valeurs par defaut.

### Logic Unit 3 : Record Suffix (Handler S - Level R)

**Condition** : Expression 89

| Ligne | Operation | Condition/Details |
|-------|-----------|-------------------|
| 5 | **Block IF** | Exp 6 : `FJ<>0` → `montant <> 0` |
| 6 | **Call SubTask** | 1 = CAISSE v1, Cnd Exp 7 : `NOT VG.Hostname` |
| 7 | **Call SubTask** | 2 = CAISSE T2H, Cnd Exp 8 : `VG.Hostname` |
| 9 | **Block End** | `}` |

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
│ Tache 22.16.1.1 (ISN_2=56) - Update FDR Precedent                        │
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
            │ Tache 22.16.1.1.1   │ │ Tache 22.16.1.1.2   │
            │ (ISN_2=57)          │ │ (ISN_2=58)          │
            │ CAISSE v1           │ │ CAISSE T2H          │
            └─────────────────────┘ └─────────────────────┘
```

---

## 5. Analyse Expressions

### Expressions de la tache 22.16.1.1 (ISN_2=56)

| # | Formule (variables) | Formule (traduction) | Type | Description |
|---|---------------------|----------------------|------|-------------|
| 1 | `CA` | `p.Date Comptable` | Date | Date comptable du Main niveau 3 |
| 2 | `EZ` | `utilisateur` | Unicode | Utilisateur courant |
| 3 | `FA-1` | `chrono_en_cours - 1` | Numeric | Chrono session precedente |
| 4 | `'F'` | `'F'` (Fermeture) | Alpha | Constante type fermeture |
| 5 | `'F'` | `'F'` (Fermeture) | Alpha | Constante type fermeture |
| 6 | `FJ<>0` | `montant <> 0` | Boolean | Donnees FDR trouvees |
| 7 | `NOT VG.Hostname` | `NOT (VG.Hostname au lieu de...)` | Boolean | Condition CAISSE v1 |
| 8 | `VG.Hostname` | `VG.Hostname au lieu de...` | Boolean | Condition CAISSE T2H |
| 9 | `IF(Trim(DI)='COFFRE 2'...)` | `IF(type_utilisateur='COFFRE 2'...)` | Alpha | Formatage conditionnel |
| 10 | `'FALSE'LOG` | `FALSE` (valeur logique) | Boolean | Constante FALSE |
| 11 | `0` | `0` (valeur numerique) | Numeric | Constante 0 |

### Variables de la tache 22.16.1.1 (Update FDR Precedent)

**Main Source (Table 471)** :
| Variable | Nom | Type |
|----------|-----|------|
| **EZ** | utilisateur | Unicode |
| **FA** | chrono en cours | Numeric |
| **FB** | date_comptable | Date |

**Link Table 246 (histo_sessions_caisse)** :
| Variable | Nom | Type |
|----------|-----|------|
| **FC** | utilisateur | Unicode |
| **FD** | chrono_precedent | Numeric |
| **FE** | date_comptable | Date |

**Link Table 249 (histo_sessions_caisse_detail)** :
| Variable | Nom | Type |
|----------|-----|------|
| **FF** | utilisateur | Unicode |
| **FG** | chrono_session | Numeric |
| **FH** | chrono_detail | Numeric |
| **FI** | type | Unicode |
| **FJ** | montant | Numeric |

> **Note** : L'expression 6 utilise `FJ<>0` soit `montant <> 0` pour verifier qu'on a trouve des donnees FDR.

### Variables parentes utilisees dans les expressions

| Variable | Niveau | Nom | Tache source |
|----------|--------|-----|--------------|
| **CA** | 3 | p.Date Comptable | Main (22) |
| **CB** | 3 | (chrono ou valeur) | Main (22) |
| **DI** | 1 | type coffre | Reception (22.16.1) |
| **BE** | VG | variable globale | Main VIL |

### Variables FDR dans la tache parente 22.16.1 (ISN_2=19) - Reception

> Ces variables sont visibles dans la capture d'ecran de l'IDE Magic (colonnes EU et EV mises a jour en Task Prefix).

| Variable | Nom | Type | Role |
|----------|-----|------|------|
| **ET** | v.total FDR Init | Numeric | FDR initial du jour courant |
| **EU** | v.FDR fermeture de la veille | Numeric | Montant FDR cloture J-1 |
| **EV** | v.Session de Fermeture prec exi | Logical | TRUE si session J-1 existe |
| **EW** | v.total FDR Final | Numeric | FDR final du jour courant |
| **EX** | v.Ecart F.D.R. COFFRE2 | Logical | TRUE si ecart detecte sur COFFRE2 |
| **EY** | v.Ecart F.D.R. RECEPTION ? | Logical | TRUE si ecart detecte sur RECEPTION |

---

## 6. Verification Implementation

### Elements demandes vs implementes

| Element demande | Implemente ? | Preuve | Localisation |
|-----------------|--------------|--------|--------------|
| Stocker FDR veille | OUI | Variable `v.FDR fermeture de la veille` | Col 41, Tache 22.16.1 |
| Detecter session precedente | OUI | Variable `v.Session de Fermeture prec exi` | Col 42, Tache 22.16.1 |
| Flag ecart COFFRE2 | OUI | Variable `v.Ecart F.D.R. COFFRE2` | Col 39, Tache 22.16.1 |
| Flag ecart RECEPTION | OUI | Variable `v.Ecart F.D.R. RECEPTION ?` | Col 40, Tache 22.16.1 |
| Lecture session J-1 | OUI | Link Table 246 avec chrono-1 | Tache 22.16.1.1 ligne 8-12 |
| Lecture montant FDR | OUI | Link Table 249 avec type='F' | Tache 22.16.1.1 ligne 15-22 |

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

---

*DerniÃ¨re mise Ã  jour : 2026-01-22T18:55*
