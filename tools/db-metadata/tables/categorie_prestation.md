# categorie_prestation

**Nom logique Magic** : `categorie_prestation`

| Info | Valeur |
|------|--------|
| Lignes | 211 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cap_rowid` | int | 10 | non |  | 211 |
| 2 | `cap_code_categorie` | nvarchar | 3 | non |  | 198 |
| 3 | `cap_libelle_categorie_FRA` | nvarchar | 50 | non |  | 167 |
| 4 | `cap_libelle_categorie_ANG` | nvarchar | 50 | non |  | 168 |
| 5 | `cap_numero_parent` | smallint | 5 | non |  | 14 |

## Valeurs distinctes

### `cap_numero_parent` (14 valeurs)

```
0, 1, 10, 11, 12, 13, 2, 3, 4, 5, 6, 7, 8, 9
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| categorie_prestation_IDX_2 | NONCLUSTERED | non | cap_code_categorie |
| categorie_prestation_IDX_1 | NONCLUSTERED | oui | cap_rowid |

