# cafil145_dat

| Info | Valeur |
|------|--------|
| Lignes | 9263 |
| Colonnes | 20 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tro_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `tro_compte` | int | 10 | non |  | 1170 |
| 3 | `tro_filiation` | int | 10 | non |  | 13 |
| 4 | `tro_type_prod_pp_vo` | nvarchar | 1 | non |  | 2 |
| 5 | `tro_code_vol_club` | nvarchar | 6 | non |  | 66 |
| 6 | `tro_type_transport` | nvarchar | 2 | non |  | 8 |
| 7 | `tro_code_a_i_r` | nvarchar | 1 | non |  | 3 |
| 8 | `tro_date_depart_vol` | char | 8 | non |  | 212 |
| 9 | `tro_heure_depart_vol` | char | 6 | non |  | 231 |
| 10 | `tro_num_de_vol` | nvarchar | 10 | non |  | 428 |
| 11 | `tro_iata_depart` | nvarchar | 6 | non |  | 81 |
| 12 | `tro_date_arrivee_vol` | char | 8 | non |  | 206 |
| 13 | `tro_heure_arrive_vol` | char | 6 | non |  | 245 |
| 14 | `tro_iata_arrivee` | nvarchar | 6 | non |  | 82 |
| 15 | `tro_categorie_tarif` | nvarchar | 6 | non |  | 9 |
| 16 | `tro_classe` | nvarchar | 3 | non |  | 4 |
| 17 | `tro_num_pnr` | nvarchar | 12 | non |  | 1003 |
| 18 | `tro_compagnie` | nvarchar | 9 | non |  | 35 |
| 19 | `tro_affreteur` | nvarchar | 6 | non |  | 23 |
| 20 | `RowId_167` | int | 10 | non |  | 9263 |

## Valeurs distinctes

### `tro_societe` (1 valeurs)

```
C
```

### `tro_filiation` (13 valeurs)

```
0, 1, 10, 11, 12, 2, 3, 4, 5, 6, 7, 8, 9
```

### `tro_type_prod_pp_vo` (2 valeurs)

```
P, V
```

### `tro_type_transport` (8 valeurs)

```
CF, CM, DR, ND, NF, RF, TO, WT
```

### `tro_code_a_i_r` (3 valeurs)

```
A, I, R
```

### `tro_categorie_tarif` (9 valeurs)

```
CTBUS, CTCAR, CTECO, CTFIR, CTNDC, CTPRE, CTWE+, CTWEB, RQST
```

### `tro_classe` (4 valeurs)

```
BUS, ECO, FIR, PRE
```

### `tro_compagnie` (35 valeurs)

```
, AF, AI, AK, AY, BR, CA, CX, CZ, DE, EK, EY, FM, HO, HU, HX, JQ, KE, KL, LH, LJ, LX, LY, MH, NZ, OD, OZ, PG, QR, SQ, TG, TK, TR, UA, UO
```

### `tro_affreteur` (23 valeurs)

```
, 010, 020, 031, 041, 051, 071, 081, 121, 131, 141, 171, 181, 191, 211, 221, 291, 351, 361, 371, 481, 651, 701
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil145_dat_IDX_2 | NONCLUSTERED | non | tro_societe, tro_code_a_i_r, tro_date_depart_vol, tro_code_vol_club |
| cafil145_dat_IDX_3 | NONCLUSTERED | non | tro_societe, tro_date_depart_vol, tro_num_de_vol |
| cafil145_dat_IDX_1 | NONCLUSTERED | non | tro_societe, tro_compte, tro_filiation, tro_code_a_i_r, tro_date_depart_vol, tro_heure_depart_vol |
| cafil145_dat_IDX_4 | NONCLUSTERED | oui | RowId_167 |

