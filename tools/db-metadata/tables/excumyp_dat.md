# excumyp_dat

| Info | Valeur |
|------|--------|
| Lignes | 5 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `moy_code` | nvarchar | 1 | non |  | 1 |
| 2 | `moy_moyen_paiement` | nvarchar | 6 | non |  | 5 |
| 3 | `moy_libelle` | nvarchar | 15 | non |  | 5 |
| 4 | `moy_numero_classe` | int | 10 | non |  | 2 |
| 5 | `moy_modifiable__` | nvarchar | 1 | non |  | 2 |
| 6 | `moy_affichage__` | nvarchar | 1 | non |  | 2 |

## Valeurs distinctes

### `moy_moyen_paiement` (5 valeurs)

```
CASH, CMPASS, CP8, OD, VISA
```

### `moy_libelle` (5 valeurs)

```
Carte Ã  mÃ©moire, Cash, CLUB MED PASS, Od, Visa
```

### `moy_numero_classe` (2 valeurs)

```
1, 2
```

### `moy_modifiable__` (2 valeurs)

```
N, O
```

### `moy_affichage__` (2 valeurs)

```
N, O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| excumyp_dat_IDX_1 | NONCLUSTERED | oui | moy_code, moy_moyen_paiement |
| excumyp_dat_IDX_2 | NONCLUSTERED | non | moy_code, moy_numero_classe, moy_affichage__ |

