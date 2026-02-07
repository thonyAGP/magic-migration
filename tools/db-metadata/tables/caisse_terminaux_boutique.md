# caisse_terminaux_boutique

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `service_boutique` | nvarchar | 5 | non |  | 1 |
| 2 | `terminal` | int | 10 | non |  | 1 |
| 3 | `hostname_bou` | nvarchar | 50 | non |  | 1 |

## Valeurs distinctes

### `service_boutique` (1 valeurs)

```
BOUT
```

### `terminal` (1 valeurs)

```
80
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_terminaux_boutique_IDX_1 | NONCLUSTERED | oui | service_boutique, terminal |
| caisse_terminaux_boutique_IDX_2 | NONCLUSTERED | oui | terminal, service_boutique |

