# cafil126_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 12 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `sld_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `sld_operateur` | nvarchar | 8 | non |  | 0 |
| 3 | `sld_date_du_solde` | char | 8 | non |  | 0 |
| 4 | `sld_heure_du_solde` | char | 6 | non |  | 0 |
| 5 | `sld_num_compte` | int | 10 | non |  | 0 |
| 6 | `sld_mode_de_paiement` | nvarchar | 4 | non |  | 0 |
| 7 | `sld_devise` | nvarchar | 3 | non |  | 0 |
| 8 | `sld_quantite` | float | 53 | non |  | 0 |
| 9 | `sld_type_taux` | int | 10 | non |  | 0 |
| 10 | `sld_taux_change` | float | 53 | non |  | 0 |
| 11 | `sld_montant` | float | 53 | non |  | 0 |
| 12 | `RowId_148` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil126_dat_IDX_1 | NONCLUSTERED | non | sld_operateur, sld_date_du_solde, sld_heure_du_solde, sld_societe, sld_num_compte |
| cafil126_dat_IDX_3 | NONCLUSTERED | oui | RowId_148 |
| cafil126_dat_IDX_2 | NONCLUSTERED | non | sld_societe, sld_num_compte |

