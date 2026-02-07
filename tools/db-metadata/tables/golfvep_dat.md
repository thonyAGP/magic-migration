# golfvep_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 18 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `vep_num_vente` | int | 10 | non |  | 0 |
| 2 | `vep_moyen_paiement` | nvarchar | 1 | non |  | 0 |
| 3 | `vep_societe` | nvarchar | 1 | non |  | 0 |
| 4 | `vep_compte` | int | 10 | non |  | 0 |
| 5 | `vep_filiation` | int | 10 | non |  | 0 |
| 6 | `vep_nom` | nvarchar | 15 | non |  | 0 |
| 7 | `vep_prenom` | nvarchar | 8 | non |  | 0 |
| 8 | `vep_date_comptable` | char | 8 | non |  | 0 |
| 9 | `vep_user` | nvarchar | 8 | non |  | 0 |
| 10 | `vep_montant` | float | 53 | non |  | 0 |
| 11 | `vep_code_parcours` | int | 10 | non |  | 0 |
| 12 | `vep_quantite` | int | 10 | non |  | 0 |
| 13 | `vep_pv_unitaire` | float | 53 | non |  | 0 |
| 14 | `vep___reduction` | int | 10 | non |  | 0 |
| 15 | `vep_reservation__` | nvarchar | 1 | non |  | 0 |
| 16 | `vep_date_parcours` | char | 8 | non |  | 0 |
| 17 | `vep_heure_parcours` | char | 6 | non |  | 0 |
| 18 | `vep_num_article` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| golfvep_dat_IDX_4 | NONCLUSTERED | non | vep_code_parcours, vep_date_parcours |
| golfvep_dat_IDX_3 | NONCLUSTERED | non | vep_code_parcours |
| golfvep_dat_IDX_1 | NONCLUSTERED | oui | vep_num_vente |
| golfvep_dat_IDX_5 | NONCLUSTERED | non | vep_societe, vep_compte, vep_filiation, vep_date_parcours |
| golfvep_dat_IDX_2 | NONCLUSTERED | non | vep_date_comptable |

