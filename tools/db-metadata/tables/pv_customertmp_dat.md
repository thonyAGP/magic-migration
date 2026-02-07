# pv_customertmp_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 14 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `gm_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `gm_compte` | int | 10 | non |  | 0 |
| 3 | `gm_filiation` | int | 10 | non |  | 0 |
| 4 | `xcust_id_tmp` | float | 53 | non |  | 0 |
| 5 | `gm_nom` | nvarchar | 30 | non |  | 0 |
| 6 | `gm_prenom` | nvarchar | 20 | non |  | 0 |
| 7 | `gm_sexe` | nvarchar | 1 | non |  | 0 |
| 8 | `gm_poids` | nvarchar | 12 | non |  | 0 |
| 9 | `gm_taille` | nvarchar | 12 | non |  | 0 |
| 10 | `gm_age` | int | 10 | non |  | 0 |
| 11 | `gm_din_skier_code` | nvarchar | 2 | non |  | 0 |
| 12 | `skier_type` | nvarchar | 5 | non |  | 0 |
| 13 | `snowboarder_type` | nvarchar | 5 | non |  | 0 |
| 14 | `damage_protection` | bit |  | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_customertmp_dat_IDX_1 | NONCLUSTERED | oui | gm_societe, gm_compte, gm_filiation |
| pv_customertmp_dat_IDX_2 | NONCLUSTERED | oui | xcust_id_tmp |

