# tg

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `code` | nvarchar | 6 | non |  | 1 |
| 3 | `libelle` | nvarchar | 40 | non |  | 1 |
| 4 | `valeur_alpha` | nvarchar | 10 | non |  | 1 |
| 5 | `valeur_num` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `code` (1 valeurs)

```
EZGUA
```

### `libelle` (1 valeurs)

```
Controle guarantie pour EZCard
```

### `valeur_alpha` (1 valeurs)

```
Oui
```

### `valeur_num` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| tg_IDX_1 | NONCLUSTERED | oui | societe, code |

