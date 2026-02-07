# caisse_session_coffre2

| Info | Valeur |
|------|--------|
| Lignes | 938 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `date_ouverture_caisse_90` | char | 8 | non |  | 895 |
| 2 | `heure_ouverture_caisse_90` | char | 6 | non |  | 929 |
| 3 | `chrono` | float | 53 | non |  | 937 |
| 4 | `utilisateur` | nvarchar | 8 | non |  | 1 |

## Valeurs distinctes

### `utilisateur` (1 valeurs)

```
WELCMGR
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_session_coffre2_IDX_1 | NONCLUSTERED | oui | date_ouverture_caisse_90, heure_ouverture_caisse_90, chrono, utilisateur |

