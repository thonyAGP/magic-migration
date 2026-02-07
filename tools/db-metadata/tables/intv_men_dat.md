# intv_men_dat

| Info | Valeur |
|------|--------|
| Lignes | 25 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `lieu_de_sejour` | nvarchar | 1 | non |  | 1 |
| 3 | `code_logement` | nvarchar | 6 | non |  | 25 |
| 4 | `intervalle_menage` | int | 10 | non |  | 1 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `lieu_de_sejour` (1 valeurs)

```
G
```

### `code_logement` (25 valeurs)

```
A2, A2+, A2+A2, A2A, B2, B2+B2, B2+B2A, B2A, B4, B4T, C2, C2+, C2+C2, C2+C2A, C2A, C2A+, CO, GO, H2, H4, S2, S2+A2, S2+B2, S2+B2A, S2A
```

### `intervalle_menage` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| intv_men_dat_IDX_1 | NONCLUSTERED | oui | societe, lieu_de_sejour, code_logement |

