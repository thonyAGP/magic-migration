# cafil046_dat

| Info | Valeur |
|------|--------|
| Lignes | 34 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cpt_societe` | nvarchar | 1 | non |  | 3 |
| 2 | `cpt_nom_compteur` | nvarchar | 11 | non |  | 29 |
| 3 | `cpt_libelle` | nvarchar | 15 | non |  | 10 |
| 4 | `cpt_dernier_code` | int | 10 | non |  | 19 |

## Valeurs distinctes

### `cpt_societe` (3 valeurs)

```
, C, G
```

### `cpt_nom_compteur` (29 valeurs)

```
2499, 2599, CCHG, CCPT, CCREA, CMESS, CPKS, CSOLD, CSUPP, CTEL, CVER, CVRL, CVTE, F1701, F1704, F1705, F1707, F1708, F1709, F1710, F1711, F1712, F1802, F1803, F1806, F1812, F1908, F1912, TENCAISS
```

### `cpt_libelle` (10 valeurs)

```
, Change, Codes autocom, Comptes GM, CrÃ©ation, Messagerie, PiÃ¨ce de caisse, Solde, Suppression, Versmnt/Retrait
```

### `cpt_dernier_code` (19 valeurs)

```
0, 1, 101333, 101397, 1722, 18622, 195, 2, 29176, 3, 317915, 33, 385004, 4, 45773, 503, 534835, 678578, 7024
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil046_dat_IDX_1 | NONCLUSTERED | oui | cpt_societe, cpt_nom_compteur |

