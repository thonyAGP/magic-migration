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

## CLASSEMENT DES PISTES PAR SUSPICION (2026-01-12)

### PISTE 1 : Expression 28 avec MODEDAYINC - HAUTE SUSPICION

**Localisation** : Tache 186.1.5.4.3 "Saisir Date Fin de location" (ISN_2=49)

**Expression decouverte** (ligne XML 61791) :
```
Expression 28 = Date() - GetParam('MODEDAYINC') + {0,7}
             = Date() - MODEDAYINC + V.DateEndSelected
```

**Analyse** :
- `GetParam('MODEDAYINC')` retourne 0 (AM) ou 1 (PM)
- En Magic, les dates sont stockees comme numeriques (jours depuis epoch)
- Si MODEDAYINC=1, le calcul devient : `AujourdHui - 1 + DateFinSelectionnee`

**Probleme potentiel** :
Cette expression melange des dates de maniere confuse. Elle est utilisee pour calculer une date qui sera ensuite affichee. Le `-1` de MODEDAYINC pourrait causer le decalage observe.

**Verification requise** :
1. Quelle est la valeur de MODEDAYINC sur VTHC ?
2. Ou cette expression est-elle utilisee exactement ?
3. Tester avec MODEDAYINC=0 vs MODEDAYINC=1

---

### PISTE 2 : Update desactive dans UpdateCustRentals - MOYENNE SUSPICION

**Localisation** : Tache 186.1.5.4.4 "UpdateCustRentals" (ISN_2=50, ligne XML 65616)

**Decouverte** :
```xml
<Update FlowIsn="11">
  <FieldID val="4"/>
  <WithValue val="4"/>
  <Disabled val="1"/>  <!-- DESACTIVE ! -->
</Update>
```

**Interpretation** :
- FieldID=4 = Colonne 10 dans la table = probablement une date
- Cet update est INTENTIONNELLEMENT desactive
- Les autres updates (FieldID 5,6,7,8) sont actifs

**Hypothese** :
L'update de la date a ete desactive volontairement ou par erreur. Si c'etait cense mettre a jour V.DernierJourLocation, cela expliquerait pourquoi la date affichee est incorrecte.

**Verification requise** :
1. Pourquoi cet update est-il desactive ?
2. Quel champ de quelle table est concerne ?
3. Reactiver et tester

---

### PISTE 3 : Confusion de tables - MOYENNE SUSPICION

**Decouverte** :
Les deux taches "UpdateCustRentals" (ISN_2=47 et 50) utilisent :
- **obj=404** = pv_sellers_by_week (table vendeurs par semaine)
- **PAS obj=400** = pv_cust_rentals (table locations clients)

**Probleme potentiel** :
Le nom des taches suggere qu'elles doivent mettre a jour `pv_cust_rentals`, mais elles mettent a jour `pv_sellers_by_week`. Les dates de location pourraient ne pas etre mises a jour dans la bonne table.

**Tables concernees** :

| obj | Nom logique | Nom physique | Role |
|-----|-------------|--------------|------|
| 400 | pv_cust_rentals | pv_rentals_dat | Locations clients (READ dans task 45) |
| 404 | pv_sellers_by_week | pv_sellersweek_dat | Stats vendeurs (WRITE dans tasks 47,50) |

**Verification requise** :
1. La date affichee vient-elle de pv_cust_rentals ou pv_sellers_by_week ?
2. Y a-t-il une autre tache qui met a jour pv_cust_rentals ?

---

### PISTE 4 : Calcul QU (V.NumberDaysAFacture) - BASSE SUSPICION

**Statut** : PARTIELLEMENT ECARTEE

Les montants sont corrects, ce qui suggere que le calcul du nombre de jours est correct. Cependant, QU pourrait etre utilise pour l'affichage des dates et non seulement pour le calcul des montants.

**Expression 26** (task 45) :
```
{0,6} - {0,5} + 1 = V.DernierJourLocation - V.PremierJourLocation + 1
```

**Verification** :
Confirmer que QU n'est pas utilise dans l'expression d'affichage des dates.

---

### PISTE 5 : Updates parent depuis sous-tache - BASSE SUSPICION

**Localisation** : Tache 186.1.5.4.3 event "Valider" (lignes XML 64944-64980)

**Flux decouvert** :
```
Calendrier → Utilisateur selectionne dates → Clic "Valider"
     ↓
Update Parent FieldID=5 ← Expression 13 = V.DateSatrtSelected
Update Parent FieldID=6 ← Expression 14 = V.DateEndSelected
```

**Mapping colonnes tache parent (186.1.5.4)** :

| Column ID | Variable | Nom | Type |
|-----------|----------|-----|------|
| 4 | WB | BP. Exit | Alpha |
| 5 | WC | V days difference | Numeric |
| 6 | WD | V allow cancel | Logical |
| 7 | WE | V.Comment annulation | Alpha |
| 10 | WG | V.DernierJourLocation | Date |
| 11 | WF | V.PremierJourLocation | Date |
| 14 | - | V.NumberDaysAFacture | Numeric |
| 15 | - | V.AnnulerToutLaPeriode | Logical |

**Observation** :
- FieldID=5 et FieldID=6 dans le parent = V days difference (Numeric) et V allow cancel (Logical)
- **PAS** V.PremierJourLocation ou V.DernierJourLocation !
- Les dates sont aux FieldID 10 et 11, pas 5 et 6

**Probleme potentiel** :
Les updates envoient les dates vers les mauvais champs du parent ?

---

## SYNTHESE ET PRIORITES

| Piste | Suspicion | Action | Effort |
|-------|-----------|--------|--------|
| **1. Expression 28 + MODEDAYINC** | HAUTE | Tracer valeur MODEDAYINC, tester impact | 2h |
| **2. Update desactive FieldID=4** | MOYENNE | Reactiver et tester | 30min |
| **3. Confusion tables 400/404** | MOYENNE | Verifier source dates affichees | 1h |
| **4. Calcul QU** | BASSE | Deja verifie (montants OK) | - |
| **5. Updates parent mauvais FieldID** | BASSE | Verifier mapping exact | 1h |

---

## RECOMMANDATIONS

### Test immediat (sans modification code)

1. **Verifier MODEDAYINC** :
   ```sql
   SELECT * FROM sys_params WHERE param_name = 'MODEDAYINC'
   ```

2. **Comparer dates BDD vs affichage** :
   ```sql
   SELECT
       rental_id,
       date_debut,
       date_fin,
       status
   FROM pv_rentals_dat
   WHERE rental_id = [ID de la location du ticket]
   ```

### Test avec modification (environnement test)

1. **Reactiver update FieldID=4** dans tache 186.1.5.4.4
2. **Forcer MODEDAYINC=0** et retester
3. **Tracer** avec logs les valeurs de WF, WG, QU lors de l'Early Return

---

## Arborescence des taches

```
PVE IDE 186 - Main Sale
  └── 186.1 - Choix Onglet
       └── 186.1.5 - Sales
            └── 186.1.5.4 - actions (ISN_2=45)
                 ├── 186.1.5.4.1 - Cancel other Packages (ISN_2=46)
                 │    └── UpdateCustRentals (ISN_2=47) → obj=404
                 ├── 186.1.5.4.2 - Saisie comment annulation (ISN_2=48)
                 ├── 186.1.5.4.3 - Saisir Date Fin de location (ISN_2=49) ← CALENDRIER
                 └── 186.1.5.4.4 - UpdateCustRentals (ISN_2=50) → obj=404
```

---

*Derniere mise a jour: 2026-01-12 22:30*
*Status: INVESTIGATION APPROFONDIE - 5 pistes identifiees*
*Piste prioritaire: Expression 28 avec MODEDAYINC*
