# cafil078_dat

| Info | Valeur |
|------|--------|
| Lignes | 10 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ddv_societe` | nvarchar | 1 | non |  | 5 |
| 2 | `ddv_moyen_paiement` | nvarchar | 5 | non |  | 2 |
| 3 | `ddv_libelle` | nvarchar | 20 | non |  | 2 |
| 4 | `ddv_code_modif` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `ddv_societe` (5 valeurs)

```
A, B, C, D, G
```

### `ddv_moyen_paiement` (2 valeurs)

```
CASH, TRVL
```

### `ddv_libelle` (2 valeurs)

```
EspÃ¨ces, Travellers
```

### `ddv_code_modif` (1 valeurs)

```
O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil078_dat_IDX_1 | NONCLUSTERED | oui | ddv_societe, ddv_moyen_paiement |

