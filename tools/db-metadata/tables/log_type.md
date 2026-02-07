# log_type

| Info | Valeur |
|------|--------|
| Lignes | 10 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `lgt_id` | int | 10 | non |  | 10 |
| 2 | `lgt_label` | nvarchar | 40 | non |  | 10 |
| 3 | `lgt_parent` | int | 10 | oui |  | 2 |
| 4 | `lgt_json_in` | bit |  | oui |  | 2 |
| 5 | `lgt_json_out` | bit |  | oui |  | 2 |

## Valeurs distinctes

### `lgt_id` (10 valeurs)

```
1, 10, 2, 3, 4, 5, 6, 7, 8, 9
```

### `lgt_label` (10 valeurs)

```
BLOCAGE DE FONDS, GARANTIE, ODYSSEY, PAIEMENT, PAIEMENT API, SOLDE, TOKEN, VALIDATION VENTE, VENTE, VERIFICATION GARANTIE
```

### `lgt_parent` (2 valeurs)

```
1, 6
```

### `lgt_json_in` (2 valeurs)

```
0, 1
```

### `lgt_json_out` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_type_IDX_1 | NONCLUSTERED | oui | lgt_id |

