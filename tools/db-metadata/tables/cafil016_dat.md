# cafil016_dat

| Info | Valeur |
|------|--------|
| Lignes | 857 |
| Colonnes | 27 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ctg_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `ctg_compte_gm` | int | 10 | non |  | 352 |
| 3 | `ctg_filiation` | int | 10 | non |  | 2 |
| 4 | `ctg_imputation` | float | 53 | non |  | 10 |
| 5 | `ctg_sous_imputation` | int | 10 | non |  | 16 |
| 6 | `ctg_libelle` | nvarchar | 20 | oui |  | 23 |
| 7 | `ctg_libelle_supplem` | nvarchar | 20 | oui |  | 844 |
| 8 | `ctg_credit_debit` | nvarchar | 1 | non |  | 2 |
| 9 | `ctg_flag_annulation` | nvarchar | 1 | non |  | 2 |
| 10 | `ctg_code_type` | nvarchar | 1 | non |  | 1 |
| 11 | `ctg_numero_chrono` | int | 10 | non |  | 1 |
| 12 | `ctg_avec_change` | nvarchar | 1 | non |  | 1 |
| 13 | `ctg_mode_de_paiement` | nvarchar | 4 | non |  | 1 |
| 14 | `ctg_montant` | float | 53 | non |  | 192 |
| 15 | `ctg_date_comptable` | char | 8 | non |  | 211 |
| 16 | `ctg_date_d_operation` | char | 8 | non |  | 212 |
| 17 | `ctg_heure_operation` | char | 6 | non |  | 717 |
| 18 | `ctg_nbre_d_articles` | int | 10 | non |  | 1 |
| 19 | `ctg_flag_hotesses` | nvarchar | 1 | non |  | 2 |
| 20 | `ctg_type_transaction` | nvarchar | 1 | non |  | 2 |
| 21 | `ctg_operateur` | nvarchar | 8 | non |  | 13 |
| 22 | `RowId_38` | int | 10 | non |  | 857 |
| 23 | `ctg_id_ligne_annulation` | int | 10 | non |  | 1 |
| 24 | `ctg_num_ticket` | nvarchar | 50 | non |  | 1 |
| 25 | `ctg_num_ligne` | int | 10 | non |  | 1 |
| 26 | `ctg_ref_article` | float | 53 | non |  | 2 |
| 27 | `ctg_service` | nvarchar | 4 | non |  | 1 |

## Valeurs distinctes

### `ctg_societe` (1 valeurs)

```
C
```

### `ctg_filiation` (2 valeurs)

```
0, 1
```

### `ctg_imputation` (10 valeurs)

```
4.6763e+008, 4.67675e+008, 7.0641e+008, 7.0761e+008
```

### `ctg_sous_imputation` (16 valeurs)

```
101, 103, 104, 105, 112, 114, 121, 122, 126, 128, 131, 132, 14, 17, 18, 7
```

### `ctg_libelle` (23 valeurs)

```
A LA CARTE, ALCOHOL HBSI, Baln?o/ Esth?ti, BalnÃ©o/ EsthÃ©ti, Bar Hors BSI, CAKE, CHALONG BAY RUM, Cr?diteurs dive, ELEPHANT AD, Excursion, FANTASEA CHILD, FINE DINING, GROCERY, Hist Phuket, LOCH PALM, NON ALCOHOL BSI, PHI PHI AD, PRIVATE BOAT, Racha Island, RAFTING, scuba, SIMON AD, Spa Products
```

### `ctg_credit_debit` (2 valeurs)

```
C, D
```

### `ctg_flag_annulation` (2 valeurs)

```
A, N
```

### `ctg_code_type` (1 valeurs)

```
O
```

### `ctg_numero_chrono` (1 valeurs)

```
0
```

### `ctg_avec_change` (1 valeurs)

```
N
```

### `ctg_nbre_d_articles` (1 valeurs)

```
1
```

### `ctg_flag_hotesses` (2 valeurs)

```
A, N
```

### `ctg_type_transaction` (2 valeurs)

```
C, M
```

### `ctg_operateur` (13 valeurs)

```
ASSTFAM, BAR1, BARMGR, BTQ, EXC, EXCMGR, FAM, REST, SCUBA, SPA1, SPA2, SPA3, SPAMGR
```

### `ctg_id_ligne_annulation` (1 valeurs)

```
0
```

### `ctg_num_ligne` (1 valeurs)

```
0
```

### `ctg_ref_article` (2 valeurs)

```
0, 100
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil016_dat_IDX_1 | NONCLUSTERED | non | ctg_societe, ctg_compte_gm, ctg_date_d_operation, ctg_heure_operation |
| cafil016_dat_IDX_2 | NONCLUSTERED | non | ctg_societe, ctg_compte_gm, ctg_filiation, ctg_date_d_operation, ctg_heure_operation |
| cafil016_dat_IDX_5 | NONCLUSTERED | non | ctg_societe, ctg_date_comptable, ctg_operateur, ctg_code_type |
| cafil016_dat_IDX_6 | NONCLUSTERED | oui | RowId_38 |
| cafil016_dat_IDX_3 | NONCLUSTERED | non | ctg_societe, ctg_compte_gm, ctg_code_type, ctg_date_d_operation, ctg_heure_operation |
| cafil016_dat_IDX_4 | NONCLUSTERED | non | ctg_societe, ctg_date_comptable, ctg_code_type |

