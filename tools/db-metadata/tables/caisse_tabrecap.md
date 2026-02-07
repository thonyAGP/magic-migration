# caisse_tabrecap

| Info | Valeur |
|------|--------|
| Lignes | 1424 |
| Colonnes | 28 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono` | smallint | 5 | non |  | 36 |
| 2 | `operateur` | nvarchar | 8 | non |  | 87 |
| 3 | `date_comptable` | char | 8 | non |  | 70 |
| 4 | `numero_session` | float | 53 | non |  | 77 |
| 5 | `type` | nvarchar | 1 | non |  | 15 |
| 6 | `ordre_edition` | nvarchar | 2 | non |  | 15 |
| 7 | `type_approversement_coffre` | nvarchar | 1 | non |  | 4 |
| 8 | `mode_de_paiement` | nvarchar | 4 | non |  | 6 |
| 9 | `avec_change` | nvarchar | 1 | non |  | 2 |
| 10 | `code_devise` | nvarchar | 3 | non |  | 3 |
| 11 | `quantite_devise` | float | 53 | non |  | 3 |
| 12 | `taux_devise` | float | 53 | non |  | 3 |
| 13 | `montant` | float | 53 | non |  | 172 |
| 14 | `montant_monnaie` | float | 53 | non |  | 94 |
| 15 | `montant_produits` | float | 53 | non |  | 23 |
| 16 | `montant_cartes` | float | 53 | non |  | 33 |
| 17 | `montant_cheques` | float | 53 | non |  | 1 |
| 18 | `montant_od` | float | 53 | non |  | 42 |
| 19 | `societe` | nvarchar | 1 | non |  | 2 |
| 20 | `compte_village` | int | 10 | non |  | 99 |
| 21 | `filiation_village` | smallint | 5 | non |  | 5 |
| 22 | `imputation` | float | 53 | non |  | 20 |
| 23 | `sous_imputation` | smallint | 5 | non |  | 8 |
| 24 | `libelle` | nvarchar | 15 | non |  | 56 |
| 25 | `libelle_complementaire` | nvarchar | 15 | non |  | 55 |
| 26 | `nom_gm` | nvarchar | 30 | non |  | 91 |
| 27 | `quantite_article` | smallint | 5 | non |  | 6 |
| 28 | `prix_article` | float | 53 | non |  | 3 |

## Valeurs distinctes

### `chrono` (36 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 3, 30, 31, 32, 33, 34, 35, 36, 4, 5, 6, 7, 8, 9
```

### `type` (15 valeurs)

```
A, B, C, D, E, F, G, H, I, J, K, L, M, N, O
```

### `ordre_edition` (15 valeurs)

```
01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 90
```

### `type_approversement_coffre` (4 valeurs)

```
, A, E, V
```

### `mode_de_paiement` (6 valeurs)

```
, AMEX, CASH, OD, VISA, WECH
```

### `avec_change` (2 valeurs)

```
, N
```

### `code_devise` (3 valeurs)

```
, AUD, JPY
```

### `quantite_devise` (3 valeurs)

```
0, 100, 10000
```

### `taux_devise` (3 valeurs)

```
0, 0.291, 21.3275
```

### `montant_produits` (23 valeurs)

```
0, 10380, 1120, 12730, 1280, -1300, 1440, 160, -160, 1600, 210, 2600, -320, 4110, 480, -480, 5200, 640, -640, 7550, -800, 8095, 9080
```

### `montant_cartes` (33 valeurs)

```
0, 11000, 1145, 11815, 13545, 17490, 1800, 1845, 19900, 2108, 25680, -25680, 2600, 29645, 3140, -3140, 3200, 33184, 33380, -33380, 3600, 3850, 4130, 4260, 5200, 6300, 6950, 7400, 800, 8000, 890, 9800, -9800
```

### `montant_cheques` (1 valeurs)

```
0
```

### `montant_od` (42 valeurs)

```
0, 1080, 1190, 120, 1200, 1280, 1300, 1400, -1400, 1593.29, 160, 1620, 1800, 1890, 2000, -2000, 2230.61, -2300, 2600, 270, 290, 2916, 3100, 320, 32384, -32384, 340, 3780, 380, 385, 395, -41652, 480, 540, -6120, 615, 640, 650, 6585.6, 800, 960, 965
```

### `societe` (2 valeurs)

```
, C
```

### `filiation_village` (5 valeurs)

```
0, 1, 2, 5, 6
```

### `imputation` (20 valeurs)

```
0, 4.67635e+008, 4.6763e+008, 4.6764e+008, 4.6765e+008, 4.6767e+008, 5.1131e+008, 5.1132e+008, 5.11331e+008, 5.32188e+008, 5.801e+008, 6.2341e+008, 7.0625e+008, 7.0641e+008, 7.0642e+008, 7.0887e+008, 7.588e+008
```

### `sous_imputation` (8 valeurs)

```
0, 101, 102, 104, 105, 21, 25, 38
```

### `quantite_article` (6 valeurs)

```
0, 1, 2, 3, 4, 5
```

### `prix_article` (3 valeurs)

```
0, 1300, 160
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_tabrecap_IDX_2 | NONCLUSTERED | non | operateur, ordre_edition, chrono |
| caisse_tabrecap_IDX_1 | NONCLUSTERED | oui | operateur, chrono |

