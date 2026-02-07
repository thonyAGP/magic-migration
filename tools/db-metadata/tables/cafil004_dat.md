# cafil004_dat

| Info | Valeur |
|------|--------|
| Lignes | 57 |
| Colonnes | 15 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `spc_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `spc_num_compte` | int | 10 | non |  | 56 |
| 3 | `spc_filiation` | int | 10 | non |  | 2 |
| 4 | `spc_nom` | nvarchar | 15 | non |  | 38 |
| 5 | `spc_prenom` | nvarchar | 10 | non |  | 6 |
| 6 | `spc_titre` | nvarchar | 2 | non |  | 3 |
| 7 | `spc_type_client` | nvarchar | 1 | non |  | 1 |
| 8 | `spc_num_club` | float | 53 | non |  | 54 |
| 9 | `spc_lettre_controle` | nvarchar | 1 | non |  | 1 |
| 10 | `spc_filiation_club` | int | 10 | non |  | 3 |
| 11 | `spc_fictif` | bit |  | non |  | 1 |
| 12 | `spc_flag_cash` | nvarchar | 1 | non |  | 2 |
| 13 | `spc_service` | nvarchar | 4 | non |  | 12 |
| 14 | `spc_vente_hors_place` | bit |  | non |  | 1 |
| 15 | `spc_credit_bar` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `spc_societe` (1 valeurs)

```
C
```

### `spc_filiation` (2 valeurs)

```
0, 1
```

### `spc_nom` (38 valeurs)

```
BABY SITTER, BAR COMMERCIAL, CASH BABY CLUB, CASH BAR CASH, CASH BAR DEC 20, CASH BAR NOV 20, CASH BOUTIQUE C, CASH BOUTIQUE D, CASH BOUTIQUE N, CASH EXCURSION, CASH INFIRMERIE, CASH KLOOK, CASH LAUNDRY/BU, CASH MINI CLUB, CASH OUTSIDE, CASH RESTAURANT, CASH SPA CASH, CASH SPA DEC 20, CASH SPA NOV 20, CASH SPORTS NAU, CASH SPORTS TER, CASH TAILOR, CASH TAILOR OCT, CHEF DE VILLAGE, FAM KOR2025, FAM RUSSIA 2025, FAM SGMY2025, FAM THAI 2025, SEM ADS HELPER, SEM BIDVEST STE, SEM BRICKS LUNI, SEM CTSERVICES, SEM ODIN, SEM PTT OIL, SEM PVT, SEM ROTARY CLUB, SEM SKK RIDERS, SEM XINLIANGJI
```

### `spc_prenom` (6 valeurs)

```
, 2025, CASH, DEC 2025, NOV 2025, OCT 2025
```

### `spc_titre` (3 valeurs)

```
, Me, Mr
```

### `spc_type_client` (1 valeurs)

```
C
```

### `spc_lettre_controle` (1 valeurs)

```
U
```

### `spc_filiation_club` (3 valeurs)

```
0, 1, 2
```

### `spc_fictif` (1 valeurs)

```
0
```

### `spc_flag_cash` (2 valeurs)

```
, C
```

### `spc_service` (12 valeurs)

```
, BABY, BARD, BOUT, ESTH, EXCU, INFI, MINI, PRES, REST, SPNA, SPTE
```

### `spc_vente_hors_place` (1 valeurs)

```
0
```

### `spc_credit_bar` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil004_dat_IDX_3 | NONCLUSTERED | oui | spc_societe, spc_type_client, spc_num_club, spc_filiation_club |
| cafil004_dat_IDX_1 | NONCLUSTERED | oui | spc_societe, spc_num_compte, spc_filiation |
| cafil004_dat_IDX_2 | NONCLUSTERED | non | spc_societe, spc_nom, spc_prenom |

