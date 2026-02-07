# caisse_central_activite

| Info | Valeur |
|------|--------|
| Lignes | 41 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code` | int | 10 | non |  | 41 |
| 2 | `libelle` | nvarchar | 64 | non |  | 41 |
| 3 | `classe_6` | bit |  | non |  | 2 |
| 4 | `classe_7` | bit |  | non |  | 2 |

## Valeurs distinctes

### `code` (41 valeurs)

```
110, 115, 201, 205, 210, 211, 215, 230, 231, 233, 239, 254, 255, 256, 257, 271, 272, 273, 274, 276, 277, 278, 279, 295, 325, 340, 350, 354, 360, 382, 384, 385, 391, 395, 405, 417, 421, 422, 444, 468, 765
```

### `libelle` (41 valeurs)

```
Animation, Arts et culture, Autres sports nautiques, Autres sports terrestres, Baby club, BalnÃ©o/ EsthÃ©tique/ Massage / Fitness, BB Welcome, Boissons alcoolisÃ©es - bar BSI, Boissons alcoolisÃ©es restaurant, Boissons non alcoolisÃ©es - bar BSI, Boutique, Change / RÃ©sultat financier, Cirque, Club Ado, CongrÃ¨s et sÃ©minaires, Conventions et SÃ©minaires internes, Cuisine, Eductour, Equitation, Espaces Verts, Excursion, Golf, GratuitÃ© Bar CMA, Grippe A, HÃ©bergement, Lingerie, Maintenance, Marketing - Commercial, Mini club, PlongÃ©e bouteille, RÃ©ception, Restaurant, SÃ©jours, Services communs, Ski de neige, Ski nautique, Transfert, Travel & Truip Press and VIP, UniversitÃ© des Talents - Fonctions hotellerie et loisirs, UniversitÃ© des Talents - Fonctions supports, Ventes assurances ski en village
```

### `classe_6` (2 valeurs)

```
0, 1
```

### `classe_7` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_central_activite_IDX_1 | NONCLUSTERED | oui | code |

