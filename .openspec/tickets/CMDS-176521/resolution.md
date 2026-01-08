# Resolution CMDS-176521

## Statut: DIAGNOSTIC COMPLET - EN ATTENTE FIX

## Diagnostic

**Bug d'affichage du prix remise dans le POS (module PVE)**

Le prix remise affiche une valeur incorrecte (41,857 au lieu de 5,400).
Le prix facture a la validation est CORRECT.

### Programmes analyses

| Programme | Role | Resultat |
|-----------|------|----------|
| **PVE IDE 186 - Main Sale** | Ecran principal POS | Expression 33 calcule correctement le prix remise |
| **PVE IDE 201 - Discounts** | Gestion remises | Expression 30 calcule correctement |

### Le calcul est CORRECT

**Expression 30 (PVE IDE 201 - Discounts):**
```
IF(Val(M,'') <> 0,
   Val(M,'10.2'),      -- Si prix manuel saisi (variable M)
   D*(1-B/100))        -- Sinon calcul auto: Prix(D) * (1 - %Remise(B)/100)
```

**Variables:**
- B = % Remise (index 1)
- D = Prix original (index 3)
- M = Prix manuel remise (index 12)

**Exemple:**
- Prix original D = 6,000 JPY
- % Remise B = 10
- Resultat = 6000 * (1 - 10/100) = 6000 * 0.9 = **5,400 JPY** (CORRECT)

### Cause racine identifiee

**Hypothese principale: Picture Format Mismatch**

Le resultat de Expression 30 est correct (5400), mais l'AFFICHAGE dans PVE IDE 186 utilise:
1. Un **mauvais format Picture** (ex: 3.2 au lieu de N10.2C)
2. Ou une **mauvaise variable** est liee au champ d'affichage
3. Ou la variable **M** (prix manuel) est mal alimentee et contient 41857

**Observation:** La valeur 41,857 pourrait etre:
- Un solde cumule du compte BAR CASH
- Un total d'autres lignes de vente
- Une valeur residuelle dans la variable M

### Variables critiques

| Variable | Index | Role | A verifier |
|----------|-------|------|------------|
| G | 6 | Resultat prix remise (FieldID 7) | Picture doit etre N10.2C |
| M | 12 | Prix manuel remise | Doit etre vide si pas de prix force |
| B | 1 | % Remise | Valeur saisie par utilisateur |
| D | 3 | Prix original | Prix du produit |

## Solution proposee

### Option 1: Fix Picture Format

Dans PVE IDE 186 - Main Sale, verifier le controle du formulaire qui affiche le prix remise et s'assurer que:
- La Picture est coherente avec le format numerique retourne (N10.2C)
- Le champ reference bien le resultat de Expression 33 (pas une autre variable)

### Option 2: Fix Variable M (prix manuel)

Dans PVE IDE 201 - Discounts, ajouter une initialisation explicite:
```magic
M = 0  -- Ou ''
```
Avant le calcul pour s'assurer que la branche ELSE est executee.

### Option 3: Verifier le binding dans le formulaire

Dans PVE IDE 186 - Main Sale, s'assurer que le controle "Prix remise" est lie a la bonne variable:
- Doit pointer sur le resultat de Expression 33
- Pas sur une variable de solde ou de total

## Validation

- [ ] Identifier le controle du formulaire Main Sale qui affiche le prix remise
- [ ] Verifier la Picture du controle (doit etre N10.2C ou equivalent)
- [ ] Verifier la variable source du controle (doit etre Expression 33)
- [ ] Tester avec differents % de remise (5%, 10%, 20%, 50%, 100%)
- [ ] Verifier que M est vide avant le calcul

## Ticket Jira Dev

Davide (CMDS) a confirme:
- Ticket Jira dev ouvert pour prochaine release PMS
- Correction prevue avant fin janvier 2026

## References Magic IDE

### Programmes

| IDE | Projet | Nom Public | Description |
|-----|--------|------------|-------------|
| PVE IDE 186 | PVE | Main Sale | Ecran principal POS |
| PVE IDE 201 | PVE | Discounts | Gestion remises |

### Expressions cles

| Programme | Expression | Formule | Role |
|-----------|------------|---------|------|
| PVE IDE 186 | 33 | `Round(N*(1-ExpCalc('15'EXP)/100),10,CTX_43)` | Calcul prix remise dans CreateSales |
| PVE IDE 186 | 15 | `IF(DZ OR (DR AND CTX_96),100,IF(CZ,DD,BH))` | Calcul % remise |
| PVE IDE 201 | 30 | `IF(Val(M,'')<>0,Val(M,'10.2'),D*(1-B/100))` | Calcul prix remise dans Discounts |

### Legende variables (PVE IDE 201 - Discounts)

| Variable | Index | Description |
|----------|-------|-------------|
| B | 1 | % Remise |
| D | 3 | Prix original |
| M | 12 | Prix manuel remise (si force) |

### Legende variables (PVE IDE 186 - Main Sale, tache parent)

| Variable | Index | Description |
|----------|-------|-------------|
| N | 13 | Prix unitaire |
| BH | 59 | % Remise defaut |
| CZ | 103 | Flag condition remise |
| DD | 107 | % Remise specifique |
| DR | 121 | Flag AND condition |
| DZ | 129 | Flag OR condition |
| CTX_43 | 32768,43 | Variable contexte arrondi |
| CTX_96 | 32768,96 | Variable contexte condition |

---

*Derniere mise a jour: 2026-01-08*
*Analyse complete - En attente de correction dans release PMS*
