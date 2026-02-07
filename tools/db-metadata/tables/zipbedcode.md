# zipbedcode

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `zip_code` | nvarchar | 6 | non |  | 1 |
| 2 | `zip_libelle` | nvarchar | 30 | non |  | 1 |

## Valeurs distinctes

### `zip_code` (1 valeurs)

```
AAAZIP
```

### `zip_libelle` (1 valeurs)

```
Lits matrimoniaux
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| zipbedcode_IDX_1 | NONCLUSTERED | oui | zip_code |

