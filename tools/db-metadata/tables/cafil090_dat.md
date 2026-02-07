# cafil090_dat

| Info | Valeur |
|------|--------|
| Lignes | 1095 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `nom_de_table` | nvarchar | 5 | non |  | 62 |
| 2 | `code_langue` | nvarchar | 1 | non |  | 3 |
| 3 | `code_alpha6` | nvarchar | 10 | oui |  | 367 |
| 4 | `libelle_dix` | nvarchar | 10 | non |  | 295 |
| 5 | `libelle_trente` | nvarchar | 200 | oui |  | 704 |
| 6 | `code_numerique` | int | 10 | non |  | 34 |
| 7 | `libelle_long` | nvarchar | 100 | non |  | 46 |

## Valeurs distinctes

### `code_langue` (3 valeurs)

```
, F, G
```

### `code_numerique` (34 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 3, 30, 31, 32, 33, 4, 5, 6, 7, 8, 9
```

### `libelle_long` (46 valeurs)

```
, Broken, Cell phone, Cell phone city code, Cell phone country code, Corked, CPF Number, Defective, Email, Expired, FNRH comments, FNRH number, Forecasted guest arrival at the means of accommodation, Forecasted guest departure from the means of accommodation, Guest birth date, Guest document issuer, Guest document number, Guest full name, Guest gender, Guest home city, Guest home country, Guest home state, Guest nationality, Guest ocupation, Guest permanent address, Hotel  access key, IBGE code of guest home town, IBGE code of the last city guest departed from, IBGE code of the next city guest is departing to, Incomplete, Landline, Landline city code, Landline country code, Last city guest departed from, Last country guest departed from, Last state guest departed from, Main means of transportation to get to destination, Marker for card exclusion, Next city guest is departing to, Next country guest is departing to, Next state guest is departing to, Number of occupants in the room, Purpose of visit, Room number, Tested, Type of guest document
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil090_dat_IDX_1 | NONCLUSTERED | oui | nom_de_table, code_langue, code_alpha6 |

