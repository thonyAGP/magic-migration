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

| Variable | Nom | Type | Precision | Role |
|----------|-----|------|-----------|------|
| **ET** | v.total FDR Init | Numeric | 11.3 | FDR initial du jour courant |
| **EU** | v.total FDR Final | Numeric | 11.3 | FDR final du jour courant |
| **EV** | v.Ecart F.D.R. COFFRE2 | Logical | - | TRUE si ecart detecte sur COFFRE2 |
| **EW** | v.Ecart F.D.R. RECEPTION ? | Logical | - | TRUE si ecart detecte sur RECEPTION |
| **EX** | v.FDR fermeture de la veille | Numeric | 11.3 | Montant FDR cloture session J-1 |
| **FA** | v.Session de Fermeture prec exi | Logical | - | TRUE si une session J-1 existe |

### Dans Tache 22.16.1.1 (ISN_2=56) - Update FDR Precedent

| Variable | Nom | Type | Source |
|----------|-----|------|--------|
| **EY** | utilisateur | Unicode | temp_histo_sessions_caisse (Table 246) |
| **EZ** | chrono en cours | Numeric | temp_histo_sessions_caisse (Table 246) |
| **FJ** | montant | Numeric | histo_sessions_caisse_detail (Table 249) |

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
Ligne 1: IF Expression 6 (FJ<>0) THEN
Ligne 2:   Call Task 57 (CAISSE v1) IF Expression 7 (NOT BE)
Ligne 3:   Call Task 58 (CAISSE T2H) IF Expression 8 (BE)
Ligne 5: END IF
```

---

## Expressions cles

| ID | Formule | Description |
|----|---------|-------------|
| 1 | **CA** | p.Date Comptable (parametre Main niveau 3) |
| 2 | **EY** | Utilisateur (temp_histo_sessions_caisse) |
| 3 | **EZ-1** | Chrono en cours - 1 = chrono session precedente |
| 6 | **FJ<>0** | Verifie qu'on a trouve des donnees FDR (montant <> 0) |
| 7 | **NOT BE** | Condition pour appeler CAISSE v1 (VG.BE = flag T2H) |
| 8 | **BE** | Condition pour appeler CAISSE T2H |
| 9 | **IF(Trim(DI)='COFFRE 2', Str(CB,'3P0'), Trim(DI))** | Formatage conditionnel du type utilisateur |

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

Chaque utilisateur (COFFRE, RECEPTION, etc.) est traite independamment grace au filtre sur la variable **DI** (type utilisateur).

### Flags vs Affichage

Les variables `v.Ecart F.D.R. COFFRE2` et `v.Ecart F.D.R. RECEPTION ?` sont des **flags logiques**. L'affichage du `**` sur l'edition depend de la partie Forms/Output qui utilise ces flags (non analysee ici car hors scope Logic).

---

*Implementation documentee le 2026-01-22*
