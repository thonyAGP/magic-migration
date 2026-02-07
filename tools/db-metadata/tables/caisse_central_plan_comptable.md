# caisse_central_plan_comptable

| Info | Valeur |
|------|--------|
| Lignes | 720 |
| Colonnes | 13 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `compte` | int | 10 | non |  | 119 |
| 3 | `activite` | int | 10 | non |  | 42 |
| 4 | `article` | int | 10 | non |  | 1 |
| 5 | `libelle_service` | nvarchar | 64 | non |  | 49 |
| 6 | `libelle_fra` | nvarchar | 128 | non |  | 112 |
| 7 | `libelle_ang` | nvarchar | 128 | non |  | 49 |
| 8 | `compte_produit` | bit |  | non |  | 2 |
| 9 | `compte_charge` | bit |  | non |  | 2 |
| 10 | `compte_financier` | bit |  | non |  | 2 |
| 11 | `compte_bilan` | bit |  | non |  | 2 |
| 12 | `compte_qualification_libre` | bit |  | non |  | 1 |
| 13 | `a_partir_du` | char | 8 | non |  | 1 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `activite` (42 valeurs)

```
0, 110, 115, 201, 205, 210, 211, 215, 230, 231, 233, 239, 254, 255, 256, 257, 271, 272, 273, 274, 276, 277, 278, 279, 295, 325, 340, 350, 354, 360, 382, 384, 385, 391, 395, 405, 417, 421, 422, 444, 468, 765
```

### `article` (1 valeurs)

```
0
```

### `libelle_service` (49 valeurs)

```
, Animation, Arts et culture, Autres sports nautiques, Autres sports terrestres, Baby club, Baby Club, Baby Welcome, BalnÃ©o/ EsthÃ©tique/ Massage / Fitness, Bar, BB Welcome, Boissons alcoolisÃ©es - bar BSI, Boissons alcoolisÃ©es restaurant, Boissons non alcoolisÃ©es - bar BSI, Boutique, Change / RÃ©sultat financier, Cirque, Club Ado, CongrÃ¨s et sÃ©minaires, Conventions et SÃ©minaires internes, Cuisine, Eductour, Equitation, Espaces Verts, Excursion, Excursions, Golf, GratuitÃ© Bar CMA, Grippe A, Hebergement, HÃ©bergement, Lingerie, Maintenance, Marketing - Commercial, Mini club, PlongÃ©e bouteille, RÃ©ception, Restaurant, SÃ©jours, Services communs, Ski de neige, Ski nautique, Ski neige, Spa, Transfert, Travel & Truip Press and VIP, UniversitÃ© des Talents - Fonctions hotellerie et loisirs, UniversitÃ© des Talents - Fonctions supports, Ventes assurances ski en village
```

### `libelle_ang` (49 valeurs)

```
, Accounts receivables - Individuals - Manual entries, Bank accounts villages local currency, Bank accounts villages, other currencies, Cash in hand villages in local currency, Change, Current accounts between villages linked to the same head office, Current accounts villages, charges coming from local head office, Employee - advances and deposits paid GO GE local country, Employee - advances and deposits paid Go PS head-office / villages, Employee - advances on expenses, Internal transfers, Permanent advances - other floats, Permanent advances - receptionist float, Personnel - wages payable, Personnel - wages payable other, Sundry Creditors 1, Sundry Creditors 10, Sundry Creditors 2, Sundry Creditors 3, Sundry Creditors 4, Sundry Creditors 5, Sundry Creditors 6, Sundry Creditors 7, Sundry Creditors 8, Sundry Creditors 9, Sundry debtors 1, Sundry debtors 10, Sundry debtors 2, Sundry debtors 22, Sundry debtors 23, Sundry debtors 3, Sundry debtors 4, Sundry debtors 5, Sundry debtors 6, Sundry debtors 7, Sundry debtors 8, Sundry debtors 9, Suspense account - AP payment entries, Uncashed checks, Uncashed credit cards amex, Uncashed credit cards other, Uncashed credit cards visas, VAT payable by the company; rate 1, VAT payable by the company; rate 2, VAT return, VAT to recover on other goods and services, rate 1, VAT to recover on other goods and services; rate 2, VAT to recover on other goods and services; rate 3
```

### `compte_produit` (2 valeurs)

```
0, 1
```

### `compte_charge` (2 valeurs)

```
0, 1
```

### `compte_financier` (2 valeurs)

```
0, 1
```

### `compte_bilan` (2 valeurs)

```
0, 1
```

### `compte_qualification_libre` (1 valeurs)

```
0
```

### `a_partir_du` (1 valeurs)

```
20131127
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_central_plan_comptable_IDX_4 | NONCLUSTERED | oui | compte_charge, societe, compte, activite |
| caisse_central_plan_comptable_IDX_5 | NONCLUSTERED | oui | compte_financier, societe, compte, activite |
| caisse_central_plan_comptable_IDX_6 | NONCLUSTERED | oui | compte_bilan, societe, compte, activite |
| caisse_central_plan_comptable_IDX_2 | NONCLUSTERED | oui | societe, activite, compte |
| caisse_central_plan_comptable_IDX_3 | NONCLUSTERED | oui | compte_produit, societe, compte, activite |
| caisse_central_plan_comptable_IDX_1 | NONCLUSTERED | oui | societe, compte, activite |

