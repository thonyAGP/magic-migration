# cafil072_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `mk3_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `mk3_point_de_vente` | nvarchar | 6 | non |  | 0 |
| 3 | `mk3_libelle` | nvarchar | 20 | non |  | 0 |
| 4 | `mk3_borne_min` | int | 10 | non |  | 0 |
| 5 | `mk3_borne_max` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil072_dat_IDX_1 | NONCLUSTERED | oui | mk3_societe, mk3_point_de_vente, mk3_borne_min |

