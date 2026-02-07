# log_sessions_ouvertes

| Info | Valeur |
|------|--------|
| Lignes | 7 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `date_comptable` | char | 8 | non |  | 7 |
| 2 | `utilisateur` | nvarchar | 8 | non |  | 5 |
| 3 | `chrono_session` | float | 53 | non |  | 7 |

## Valeurs distinctes

### `date_comptable` (7 valeurs)

```
20220522, 20220717, 20230219, 20250131, 20250201, 20250521, 20250618
```

### `utilisateur` (5 valeurs)

```
APPLE, ASSTFAM, BEAM, GIFT, MIND
```

### `chrono_session` (7 valeurs)

```
189, 190, 27, 325, 36, 653, 709
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_sessions_ouvertes_IDX_2 | NONCLUSTERED | oui | utilisateur, chrono_session |
| log_sessions_ouvertes_IDX_1 | NONCLUSTERED | oui | date_comptable, utilisateur |

