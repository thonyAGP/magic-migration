# cafil021_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `sda_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `sda_compte_gm` | int | 10 | non |  | 0 |
| 3 | `sda_code_devise` | nvarchar | 3 | non |  | 0 |
| 4 | `sda_mode_paiement` | nvarchar | 4 | non |  | 0 |
| 5 | `sda_montant_depot` | float | 53 | non |  | 0 |
| 6 | `RowId_43` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil021_dat_IDX_1 | NONCLUSTERED | non | sda_societe, sda_compte_gm, sda_code_devise, sda_mode_paiement |
| cafil021_dat_IDX_2 | NONCLUSTERED | oui | RowId_43 |

