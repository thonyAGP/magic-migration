# log_initialisation_tpe

**Nom logique Magic** : `log_initialisation_tpe`

| Info | Valeur |
|------|--------|
| Lignes | 6 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `lit_num_terminal` | smallint | 5 | non |  | 6 |
| 2 | `lit_date` | char | 8 | non |  | 6 |
| 3 | `lit_num_TPE` | nvarchar | 50 | non |  | 1 |

## Valeurs distinctes

### `lit_num_terminal` (6 valeurs)

```
430, 431, 432, 433, 801, 90
```

### `lit_date` (6 valeurs)

```
20230130, 20250421, 20250501, 20250512, 20251024, 20251213
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_intitalisation_tpe_IDX_1 | NONCLUSTERED | oui | lit_num_terminal, lit_num_TPE |

