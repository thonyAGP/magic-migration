# PMS-1359 - Details Implementation

> **Jira** : [PMS-1359](https://clubmed.atlassian.net/browse/PMS-1359)

---

## Localisation exacte

| Element | Valeur |
|---------|--------|
| **Programme** | VIL IDE 22 - Print recap sessions |
| **Fichier source** | `Prg_558.xml` (ISN=558) |
| **Tache principale** | 22.16.1 (ISN_2=19) - Reception |
| **Tache cle** | 22.16.1.1 (ISN_2=56) - Update FDR Precedent |
| **Commit** | `9422490b5` (01/10/2025) |

---

## Schema de donnees

### Tables utilisees

| N° | Nom physique | Nom logique | Utilisation |
|----|--------------|-------------|-------------|
| 246 | caisse_session | histo_sessions_caisse | Session J-1 (chrono, user, date) |
| 249 | caisse_session_detail | histo_sessions_caisse_detail | Montant FDR fermeture |
| 471 | comptage_coffre_devise | (prefixe %club_user%) | Source principale |

### Champs lus dans Table 249

| FieldID | Colonne | Description |
|---------|---------|-------------|
| 7 | 1 | Utilisateur |
| 8 | 2 | Chrono |
| 9 | 3 | (non documente) |
| 10 | 4 | Type = 'F' (Fermeture) |
| 11 | 5 | Type = 'F' (Fermeture) |
| 12 | 8 | Montant FDR |

---

## Variables creees

### Dans Tache 22.16.1 (ISN_2=19) - Reception

| Col ID | Nom variable | Type | Precision | Role |
|--------|--------------|------|-----------|------|
| 18 | v.total FDR Init | Numeric | 11.3 | FDR initial du jour courant |
| 19 | v.total FDR Final | Numeric | 11.3 | FDR final du jour courant |
| 39 | v.Ecart F.D.R. COFFRE2 | Logical | - | TRUE si ecart detecte sur COFFRE2 |
| 40 | v.Ecart F.D.R. RECEPTION ? | Logical | - | TRUE si ecart detecte sur RECEPTION |
| 41 | v.FDR fermeture de la veille | Numeric | 11.3 | Montant FDR cloture session J-1 |
| 42 | v.Session de Fermeture prec exi | Logical | - | TRUE si une session J-1 existe |

---

## Logic detaillee

### Tache 22.16.1.1 - Update FDR Precedent

#### Record Main (Handler M)

```
Ligne 1:  DATAVIEW_SRC Table 471 (Main)
Ligne 3:  Select user = Expression 9
Ligne 5:  Select chrono_courant
Ligne 6:  Select date = Expression 1

Ligne 8:  LINK Table 246 (caisse_session)
Ligne 9:    Select user = Expression 2
Ligne 10:   Select chrono_precedent = Expression 3 (chrono - 1)
Ligne 11:   Select date
Ligne 12: END_LINK

Ligne 15: LINK Table 249 (caisse_session_detail)
Ligne 16:   Select user = Expression 2
Ligne 17:   Select chrono = Expression 3
Ligne 19:   Select type = 'F' (Fermeture)
Ligne 21:   Select montant_fdr (FieldID 12)
Ligne 22: END_LINK
```

#### Task Prefix (Handler P)

```
Ligne 1: Update Parent.FieldID_81 = Expression 11 ('FALSE')
Ligne 2: Update Parent.FieldID_82 = Expression 10 (formatage COFFRE)
```

> Les FieldID 81 et 82 du parent (Tache 22.16.1) recoivent les valeurs calculees.

#### Record Suffix (Handler S)

```
Ligne 1: IF Expression 6 ({0,12}<>0) THEN
Ligne 2:   Call Task 57 (CAISSE v1) IF Expression 7 (NOT VG.25)
Ligne 3:   Call Task 58 (CAISSE T2H) IF Expression 8 (NOT VG.39)
Ligne 5: END IF
```

---

## Expressions cles

| ID | Formule | Description |
|----|---------|-------------|
| 3 | `{0,2}-1` | Calcule le chrono de la session precedente |
| 6 | `{0,12}<>0` | Verifie qu'on a trouve des donnees FDR |
| 7 | `NOT {32768,25}` | Condition pour appeler CAISSE v1 |
| 8 | `NOT {32768,39}` | Condition pour appeler CAISSE T2H |
| 10 | `IF(Trim({1,2})='COFFRE 2', Str({3,2},'3P0'), Trim({1,2}))` | Formatage conditionnel du type |

---

## Algorithme simplifie

```
POUR CHAQUE ligne de comptage_coffre_devise (Table 471):

    1. Lire la session PRECEDENTE (chrono - 1) dans Table 246
       → Stocker dans v.Session de Fermeture prec exi = TRUE/FALSE

    2. SI session precedente trouvee:
       Lire le detail de FERMETURE (type='F') dans Table 249
       → Stocker montant dans v.FDR fermeture de la veille

    3. Comparer:
       - SI v.total FDR Init (J) <> v.FDR fermeture de la veille (J-1)
         → Mettre flag v.Ecart F.D.R. COFFRE2 = TRUE (ou RECEPTION)

    4. Appeler sous-taches specifiques:
       - CAISSE v1 (ISN_2=57) pour coffres standard
       - CAISSE T2H (ISN_2=58) pour coffres T2H

FIN POUR
```

---

## Notes techniques

### Ordre de lecture

La lecture se fait en ordre **descendant** sur le chrono pour toujours avoir la session la plus recente en premier, puis on fait chrono-1 pour obtenir la precedente.

### Gestion multi-utilisateurs

Chaque utilisateur (COFFRE, RECEPTION, etc.) est traite independamment grace au filtre sur Expression 9 (`{32768,39}`).

### Flags vs Affichage

Les variables `v.Ecart F.D.R. COFFRE2` et `v.Ecart F.D.R. RECEPTION ?` sont des **flags logiques**. L'affichage du `**` sur l'edition depend de la partie Forms/Output qui utilise ces flags (non analysee ici car hors scope Logic).

---

*Implementation documentee le 2026-01-22*
