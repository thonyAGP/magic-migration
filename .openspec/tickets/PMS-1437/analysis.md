# Analyse PMS-1437

> **Jira** : [PMS-1437](https://clubmed.atlassian.net/browse/PMS-1437)

## Symptome

**POS SKI: early return mauvaise date affichee**

Lors d'un EARLY RETURN sur location ski, les dates affichees sur la ligne de vente sont incorrectes.

### Exemple du ticket

| Element | Valeur |
|---------|--------|
| **Village** | VTHC (Val Thorens) |
| **Article** | SKI PRESTIGE 6 jours |
| **Periode location** | 15/12 au 20/12 |
| **Early Return** | 16/12 (2 jours utilises) |
| **Dates attendues** | 15 au 16 |
| **Dates affichees** | 16 au 17 (BUG) |

**IMPORTANT** : Les montants calcules sont CORRECTS. C'est uniquement un souci d'affichage.

## Contexte

| Element | Valeur |
|---------|--------|
| **Type** | Bug |
| **Priority** | Haute |
| **Status** | Recette KO |
| **Reporter** | Davide Morandi |
| **Assignee** | Anthony Leberre |
| **Labels** | PVE |

---

## Investigation (2026-01-12)

### ~~Piste 1 : Expression 28 - ABANDONNEE~~

L'expression 28 dans la tache 186.1.5.4 :
```
Date() - GetParam('MODEDAYINC') + QU
```

**QU = V.NumberDaysAFacture** (Numeric) = nombre de jours a facturer.

Cette expression est **CORRECTE** - elle calcule une date basee sur le nombre de jours.

### Piste 2 : Mise a jour des dates lors du RETURN - A EXPLORER

#### Flux identifie

```
186.1.5.4 "actions"
    |
    ├── 186.1.5.4.3 "Saisir Date Fin de location" (ISN_2=49)
    |       └── Calendrier .NET pour saisir nouvelle date fin
    |       └── Validation → Update vers parent (FieldID 5,6,8)
    |
    └── 186.1.5.4.4 "UpdateCustRentals" (ISN_2=50)
            └── Met a jour table pv_cust_rentals (obj=404)
```

#### Tache 186.1.5.4.3 - Saisir Date Fin de location

Variables DataView :
| Column ID | Nom | Type |
|-----------|-----|------|
| 1 | V.Calendar | Blob (MonthCalendar .NET) |
| 2 | V.DateSatrtSelected | Date ← **typo "Satrt"** |
| 3 | V.DateEndSelected | Date |
| 4 | V.CancelChecked | Logical |

**Lors de la validation** (evenement "Valider"), les valeurs sont envoyees au parent :

| Update | Expression | Valeur | Destination (parent) |
|--------|------------|--------|---------------------|
| FieldID=5 | Exp 13 = `{0,2}` | V.DateSatrtSelected | QS = V.PremierJourLocation |
| FieldID=6 | Exp 14 = `{0,3}` | V.DateEndSelected | QT = V.DernierJourLocation |
| FieldID=8 | Exp 15 = `{0,4}` | V.CancelChecked | QV = V.AnnulerToutLaPeriode |

#### Tache 186.1.5.4.4 - UpdateCustRentals

Table mise a jour : **obj=404** (pv_cust_rentals)

| Update | Expression | Valeur | Statut |
|--------|------------|--------|--------|
| FieldID=4 | Exp 4 = `{1,6}` | Date du parent | **DESACTIVE** |
| FieldID=5 | Exp 5 = `'Pending In'` | Statut | Actif |
| FieldID=6 | Exp 6 = `Date()` | Date du jour | Actif |
| FieldID=7 | Exp 7 = `Time()` | Heure actuelle | Actif |
| FieldID=8 | Exp 8 = `{32768,1}` | User | Actif |

**OBSERVATION** : L'update de FieldID=4 (date) est **DESACTIVE** (`Disabled val="1"`).

---

## Hypotheses de resolution

### Hypothese A : Bug dans le calcul de QU (V.NumberDaysAFacture)

Si QU est mal calcule lors de l'Early Return, l'expression 28 produira une date incorrecte.

**Verification** : Tracer la valeur de QU avant/apres l'Early Return.

### Hypothese B : Decalage MODEDAYINC

Le parametre MODEDAYINC (0 ou 1 selon mode AM/PM) pourrait causer un decalage de +1 jour.

**Verification** : Tester avec MODEDAYINC=0 vs MODEDAYINC=1.

### Hypothese C : Update desactive dans UpdateCustRentals

L'update FieldID=4 est desactive dans la tache 186.1.5.4.4. Peut-etre qu'il devrait etre actif pour mettre a jour correctement les dates dans pv_cust_rentals.

**Verification** : Activer cet update et tester.

---

## Prochaines etapes

1. [ ] Tracer les valeurs de QS, QT, QU lors d'un Early Return
2. [ ] Verifier si l'update desactive (FieldID=4) devrait etre actif
3. [ ] Identifier ou les dates affichees sont lues (quelle table/colonne)
4. [ ] Comparer les dates stockees vs les dates affichees

---

## Programmes et taches cles

| IDE | Nom | Role |
|-----|-----|------|
| **PVE IDE 186** | Main Sale | Programme principal |
| **186.1.5.4** | actions | Gestion des actions (Cancel, Extend, Return) |
| **186.1.5.4.3** | Saisir Date Fin de location | Saisie nouvelle date via calendrier |
| **186.1.5.4.4** | UpdateCustRentals | Mise a jour table pv_cust_rentals |

## Variables cles (Tache 186.1.5.4)

| Variable | Nom | Type | Role |
|----------|-----|------|------|
| QS | V.PremierJourLocation | Date | Date debut location |
| QT | V.DernierJourLocation | Date | Date fin location |
| QU | V.NumberDaysAFacture | Numeric | Nombre jours a facturer |
| QV | V.AnnulerToutLaPeriode | Logical | Flag annulation complete |

---

*Analyse initiale: 2026-01-12*
*Piste Expression 28: ABANDONNEE (expression correcte)*
*Nouvelle piste: Mises a jour lors du RETURN*
*Status: EN COURS D'INVESTIGATION*
