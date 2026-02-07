# activite

**Nom logique Magic** : `activite`

| Info | Valeur |
|------|--------|
| Lignes | 34 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `activite_comptable` | int | 10 | non |  | 34 |
| 2 | `libelle` | nvarchar | 50 | non |  | 25 |
| 3 | `code_service` | nvarchar | 4 | non |  | 23 |
| 4 | `categorie` | nvarchar | 30 | non |  | 13 |

## Valeurs distinctes

### `activite_comptable` (34 valeurs)

```
110, 115, 201, 205, 210, 215, 218, 219, 230, 231, 232, 234, 239, 254, 255, 256, 271, 272, 273, 274, 276, 277, 278, 295, 325, 326, 340, 350, 360, 384, 385, 386, 395, 405
```

### `libelle` (25 valeurs)

```
Animation, Arts AppliquÃ©s / Photo, Assurance Ski, Baby Club, Bar, Boutique, Economat, Equitation, Excursion, Gestion, Golf, Hebergement, Meetings & Events, Mini Club, Parking, Planning, Pressing, Restaurant, Services Communs, Ski, SPA, Sports Nautiques, Sports Terrestres, Standard, Traffic
```

### `code_service` (23 valeurs)

```
ANIM, BABY, BARD, BOUT, CMAF, ECON, EQUI, ESTH, EXCU, GEST, GOLF, MAMA, MINI, PARK, PHOT, PLAN, PRES, REST, SKIN, SPNA, SPTE, STAN, TRAF
```

### `categorie` (13 valeurs)

```
, Assurance, Autres Sports Nautiques, Baby Club, Baby Welcome, Diving, Fine Dining, Hors BSI, Produits conditionnÃ©s, Produits SPA, Soft, Soins SPA, Vin
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| activite_IDX_1 | NONCLUSTERED | oui | activite_comptable |

