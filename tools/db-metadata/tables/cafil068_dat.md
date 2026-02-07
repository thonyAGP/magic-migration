# cafil068_dat

| Info | Valeur |
|------|--------|
| Lignes | 20 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `dev_societe` | nvarchar | 1 | non |  | 5 |
| 2 | `dev_code_en_cours` | nvarchar | 1 | non |  | 1 |
| 3 | `dev_code_devise` | nvarchar | 3 | non |  | 16 |
| 4 | `dev_numero` | int | 10 | non |  | 16 |
| 5 | `dev_taux` | float | 53 | non |  | 16 |
| 6 | `dev_libelle` | nvarchar | 20 | non |  | 16 |

## Valeurs distinctes

### `dev_societe` (5 valeurs)

```
A, B, C, D, G
```

### `dev_code_en_cours` (1 valeurs)

```
O
```

### `dev_code_devise` (16 valeurs)

```
AUD, CAD, CHF, CNY, EUR, GBP, HKD, JPY, KRW, MYR, NZD, SGD, THB, TWD, USD, ZAR
```

### `dev_numero` (16 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 2, 3, 4, 5, 6, 7, 8, 9
```

### `dev_taux` (16 valeurs)

```
0.023, 0.25, 1, 1.03, 1.7, 20.72, 22.5, 24.4, 24.74, 32.53, 35.32, 35.49, 39.61, 4.16, 4.62, 7.16
```

### `dev_libelle` (16 valeurs)

```
Afrique du sud, Angleterre, Australie, Canada, Chine, CorÃ©e, Euro, Formose, Hong Kong, Japon, Malaisie, Nlle-ZÃ©lande, Singapour, Suisse, Thailande, U.S.A
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil068_dat_IDX_1 | NONCLUSTERED | oui | dev_societe, dev_code_en_cours, dev_numero |
| cafil068_dat_IDX_2 | NONCLUSTERED | oui | dev_societe, dev_code_devise |

