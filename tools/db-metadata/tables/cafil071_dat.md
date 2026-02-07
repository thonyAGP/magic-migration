# cafil071_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ven_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `ven_point_de_vente` | nvarchar | 6 | non |  | 0 |
| 3 | `ven_num_vendeur` | int | 10 | non |  | 0 |
| 4 | `ven_compte` | int | 10 | non |  | 0 |
| 5 | `ven_filiation` | int | 10 | non |  | 0 |
| 6 | `ven_nom` | nvarchar | 30 | non |  | 0 |
| 7 | `ven_prenom` | nvarchar | 8 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil071_dat_IDX_1 | NONCLUSTERED | oui | ven_societe, ven_point_de_vente, ven_num_vendeur |
| cafil071_dat_IDX_2 | NONCLUSTERED | non | ven_societe, ven_compte, ven_filiation |

