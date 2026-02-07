# taiforfait

| Info | Valeur |
|------|--------|
| Lignes | 2 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tai_code_forfait` | nvarchar | 6 | non |  | 2 |
| 2 | `tai_libelle_forfait` | nvarchar | 30 | non |  | 2 |
| 3 | `date_purge` | char | 8 | non |  | 1 |

## Valeurs distinctes

### `tai_code_forfait` (2 valeurs)

```
AAAPHU, PHUSAI
```

### `tai_libelle_forfait` (2 valeurs)

```
FORFAIRT SAI NA, FORFAIT TAI NA
```

### `date_purge` (1 valeurs)

```
00000000
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| taiforfait_IDX_1 | NONCLUSTERED | oui | tai_code_forfait |

