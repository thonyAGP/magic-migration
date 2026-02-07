# caisse_coffre_compcais_montant_histo

| Info | Valeur |
|------|--------|
| Lignes | 120 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `hism_user` | nvarchar | 8 | non |  | 2 |
| 2 | `hism_quand` | nvarchar | 1 | non |  | 1 |
| 3 | `hism_chrono_histo` | float | 53 | non |  | 10 |
| 4 | `hism_ordre` | int | 10 | non |  | 4 |
| 5 | `hism_chrono` | int | 10 | non |  | 12 |
| 6 | `hism_moyen_de_paiement` | nvarchar | 4 | non |  | 12 |
| 7 | `hism_montant` | float | 53 | non |  | 1 |
| 8 | `hism_chrono_session` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `hism_user` (2 valeurs)

```
ASSTFAM, FAM
```

### `hism_chrono_histo` (10 valeurs)

```
2396, 2397, 2398, 2399, 2400, 756, 757, 758, 759, 760
```

### `hism_ordre` (4 valeurs)

```
10, 11, 17, 99
```

### `hism_chrono` (12 valeurs)

```
1, 10, 11, 12, 2, 3, 4, 5, 6, 7, 8, 9
```

### `hism_moyen_de_paiement` (12 valeurs)

```
ALIP, AMEX, BATR, CASH, CCAU, CHQ, OD, UNIO, VADA, VADV, VISA, WECH
```

### `hism_montant` (1 valeurs)

```
0
```

### `hism_chrono_session` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_coffre_compcais_montant_histo_IDX_1 | NONCLUSTERED | oui | hism_user, hism_chrono_histo, hism_ordre, hism_chrono, hism_moyen_de_paiement |

