# cafil041_dat

| Info | Valeur |
|------|--------|
| Lignes | 48 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `par_societe` | nvarchar | 1 | non |  | 2 |
| 2 | `par_code` | int | 10 | non |  | 28 |
| 3 | `par_intitule` | nvarchar | 30 | non |  | 29 |
| 4 | `par_utilis__village` | nvarchar | 1 | non |  | 3 |
| 5 | `date_purge` | char | 8 | non |  | 1 |

## Valeurs distinctes

### `par_societe` (2 valeurs)

```
C, G
```

### `par_code` (28 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 17, 2, 3, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 4, 40, 5, 6, 7, 8, 9
```

### `par_intitule` (29 valeurs)

```
Cabine TÃ©lÃ©phone, CIA PACK ?, Infos boutique               ?, Infos planning               ?, Infos recettes               ?, Infos tÃ©lÃ©phone              ?, Nouvelle gestion caisse ?, QUADRIGA, SEJOUR PAYE, Use Kiosk Datacatching ?, Use MDR ?, Utilisation BOUTIQUE         ?, Utilisation CAISSE           ?, Utilisation ECONOMAT         ?, Utilisation EXCURSION        ?, Utilisation GESTION          ?, Utilisation MAITRESSE MAISON ?, Utilisation PLANNING         ?, Utilisation TRAFIC           ?, Village Bibop                ?, Village Carte Ã  mÃ©moire      ?, Village ClÃ© Ã©lectronique     ?, Village EZCARD, Village Parking              ?, Village PME                  ?, Village RÃ©cupÃ©ration infos   ?, Village Statistiques         ?, Village TAI, Village TÃ©lÃ©phone            ?
```

### `par_utilis__village` (3 valeurs)

```
, N, O
```

### `date_purge` (1 valeurs)

```
00000000
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil041_dat_IDX_1 | NONCLUSTERED | oui | par_societe, par_code |

