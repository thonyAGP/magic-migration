# dernsauv_dat

| Info | Valeur |
|------|--------|
| Lignes | 2837 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `dsa_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `dsa_date_sauvegarde` | char | 8 | non |  | 2837 |
| 3 | `dsa_sauvegarde_ok` | int | 10 | non |  | 1 |

## Valeurs distinctes

### `dsa_societe` (1 valeurs)

```
C
```

### `dsa_sauvegarde_ok` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| dernsauv_dat_IDX_1 | NONCLUSTERED | oui | dsa_societe, dsa_date_sauvegarde |

