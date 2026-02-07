# chemin_comptable_gp

**Nom logique Magic** : `chemin_comptable_gp`

| Info | Valeur |
|------|--------|
| Lignes | 2 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ccg_classe` | int | 10 | non |  | 2 |
| 2 | `ccg_compte_debit` | int | 10 | non |  | 2 |
| 3 | `ccg_compte_credit` | int | 10 | non |  | 2 |

## Valeurs distinctes

### `ccg_classe` (2 valeurs)

```
4, 7
```

### `ccg_compte_debit` (2 valeurs)

```
0, 706414
```

### `ccg_compte_credit` (2 valeurs)

```
706419, 708879
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| chemin_comptable_gp_IDX_1 | NONCLUSTERED | oui | ccg_classe |

