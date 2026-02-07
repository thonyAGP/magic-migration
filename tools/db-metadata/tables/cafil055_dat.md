# cafil055_dat

| Info | Valeur |
|------|--------|
| Lignes | 256 |
| Colonnes | 24 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `art_code_article` | int | 10 | non |  | 256 |
| 2 | `art_libelle_article` | nvarchar | 20 | oui |  | 235 |
| 3 | `art_libelle_imputat_` | nvarchar | 15 | non |  | 88 |
| 4 | `art_service_village` | nvarchar | 4 | non |  | 21 |
| 5 | `art_imputation` | float | 53 | non |  | 46 |
| 6 | `art_sous_imputation` | int | 10 | non |  | 44 |
| 7 | `art_top_annulation` | nvarchar | 1 | non |  | 3 |
| 8 | `art_lieux_de_vente` | nvarchar | 6 | non |  | 1 |
| 9 | `art_prix` | float | 53 | non |  | 73 |
| 10 | `art_top_maj` | nvarchar | 1 | non |  | 2 |
| 11 | `art_date_maj` | char | 8 | non |  | 97 |
| 12 | `art_forfait` | nvarchar | 1 | non |  | 2 |
| 13 | `art_remise_autorisee` | bit |  | non |  | 2 |
| 14 | `art_type_article` | nvarchar | 3 | non |  | 5 |
| 15 | `art_nb_jh` | float | 53 | non |  | 3 |
| 16 | `art_type_repas` | nvarchar | 10 | non |  | 5 |
| 17 | `art_tva` | float | 53 | non |  | 2 |
| 18 | `art_mode_paiement` | nvarchar | 4 | non |  | 1 |
| 19 | `art_gift_pass` | bit |  | non |  | 2 |
| 20 | `art_activite_comptable` | int | 10 | non |  | 9 |
| 21 | `art_stype_article` | nvarchar | 3 | non |  | 2 |
| 22 | `art_nature` | nvarchar | 1 | non |  | 2 |
| 23 | `art_force_ticket` | bit |  | non |  | 1 |
| 24 | `art_use_mobility` | bit |  | non |  | 2 |

## Valeurs distinctes

### `art_service_village` (21 valeurs)

```
, AUT1, BABY, BARD, BOUT, CAIS, CMAF, COMM, ESTH, EXCU, GEST, INFI, MINI, PHOT, PLAN, PRES, REST, SPNA, SPTE, STAN, TRAF
```

### `art_imputation` (46 valeurs)

```
0, 4.252e+008, 4.67532e+008, 4.6754e+008, 4.6762e+008, 4.67635e+008, 4.6763e+008, 4.6764e+008, 4.6765e+008, 4.67675e+008, 4.6767e+008, 5.801e+008, 6.2341e+008, 6.2513e+008, 6.475e+008, 6.588e+008, 7.0625e+008, 7.06415e+008, 7.0641e+008, 7.0642e+008, 7.0761e+008, 7.0762e+008, 7.0763e+008, 7.0887e+008, 7.0962e+008, 7.588e+008
```

### `art_sous_imputation` (44 valeurs)

```
0, 101, 102, 103, 104, 105, 106, 107, 108, 109, 11, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 121, 122, 124, 125, 126, 128, 129, 130, 131, 132, 133, 137, 14, 17, 18, 21, 25, 33, 34, 38, 7, 8, 9
```

### `art_top_annulation` (3 valeurs)

```
, N, X
```

### `art_top_maj` (2 valeurs)

```
, O
```

### `art_forfait` (2 valeurs)

```
, N
```

### `art_remise_autorisee` (2 valeurs)

```
0, 1
```

### `art_type_article` (5 valeurs)

```
, TRF, VAE, VRL, VSL
```

### `art_nb_jh` (3 valeurs)

```
0, 0.5, 1
```

### `art_type_repas` (5 valeurs)

```
, MIDI, MIDI SOIR, PTDEJ, SOIR
```

### `art_tva` (2 valeurs)

```
0, 7
```

### `art_gift_pass` (2 valeurs)

```
0, 1
```

### `art_activite_comptable` (9 valeurs)

```
0, 205, 230, 276, 325, 340, 350, 360, 385
```

### `art_stype_article` (2 valeurs)

```
, LCO
```

### `art_nature` (2 valeurs)

```
, S
```

### `art_force_ticket` (1 valeurs)

```
0
```

### `art_use_mobility` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil055_dat_IDX_1 | NONCLUSTERED | oui | art_code_article |
| cafil055_dat_IDX_4 | NONCLUSTERED | oui | art_forfait, art_code_article |
| cafil055_dat_IDX_2 | NONCLUSTERED | oui | art_imputation, art_sous_imputation, art_code_article |
| cafil055_dat_IDX_3 | NONCLUSTERED | non | art_service_village, art_code_article |

