# excuvepe_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 25 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `vep_num_vente` | int | 10 | non |  | 0 |
| 2 | `vep_moyen_paiement` | nvarchar | 6 | non |  | 0 |
| 3 | `vep_societe` | nvarchar | 1 | non |  | 0 |
| 4 | `vep_num_compte` | int | 10 | non |  | 0 |
| 5 | `vep_filiation` | int | 10 | non |  | 0 |
| 6 | `vep_nom` | nvarchar | 15 | non |  | 0 |
| 7 | `vep_prenom` | nvarchar | 8 | non |  | 0 |
| 8 | `vep_date_comptable` | char | 8 | non |  | 0 |
| 9 | `vep_user` | nvarchar | 8 | non |  | 0 |
| 10 | `vep_montant` | float | 53 | non |  | 0 |
| 11 | `vep_code_excursion` | int | 10 | non |  | 0 |
| 12 | `vep_quantite` | int | 10 | non |  | 0 |
| 13 | `vep_pv_unitaire` | float | 53 | non |  | 0 |
| 14 | `vep___reduction` | int | 10 | non |  | 0 |
| 15 | `vep_supplement` | float | 53 | non |  | 0 |
| 16 | `vep_annulation___` | nvarchar | 1 | non |  | 0 |
| 17 | `vep_date__excursion` | char | 8 | non |  | 0 |
| 18 | `vep_heure_excursion` | char | 6 | non |  | 0 |
| 19 | `vep_num_article` | int | 10 | non |  | 0 |
| 20 | `vep_chrono` | int | 10 | non |  | 0 |
| 21 | `vep_tva` | float | 53 | non |  | 0 |
| 22 | `vep_code_vendeur` | int | 10 | non |  | 0 |
| 23 | `vep_frais_annulation` | float | 53 | non |  | 0 |
| 24 | `vep_remise` | bit |  | non |  | 0 |
| 25 | `vep_qualite` | nvarchar | 2 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| excuvepe_dat_IDX_4 | NONCLUSTERED | non | vep_code_excursion, vep_date__excursion |
| excuvepe_dat_IDX_3 | NONCLUSTERED | non | vep_code_excursion |
| excuvepe_dat_IDX_1 | NONCLUSTERED | oui | vep_num_vente |
| excuvepe_dat_IDX_5 | NONCLUSTERED | non | vep_societe, vep_num_compte, vep_filiation, vep_date__excursion |
| excuvepe_dat_IDX_2 | NONCLUSTERED | non | vep_date_comptable |

