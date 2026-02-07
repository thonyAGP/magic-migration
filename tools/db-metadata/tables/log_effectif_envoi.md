# log_effectif_envoi

**Nom logique Magic** : `log_effectif_envoi`

| Info | Valeur |
|------|--------|
| Lignes | 2081 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `lee_date_envoi_effectif` | char | 8 | non |  | 1859 |
| 2 | `lee_type_traitement` | nvarchar | 6 | non |  | 4 |

## Valeurs distinctes

### `lee_type_traitement` (4 valeurs)

```
, BARCRE, FORSKI, REMQV
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_effectif_envoi_IDX_1 | NONCLUSTERED | oui | lee_type_traitement, lee_date_envoi_effectif |

