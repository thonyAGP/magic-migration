# excuinte_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 22 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `int_num_terminal` | int | 10 | non |  | 0 |
| 2 | `int_type` | nvarchar | 1 | non |  | 0 |
| 3 | `int_code` | int | 10 | non |  | 0 |
| 4 | `int_libelle` | nvarchar | 20 | non |  | 0 |
| 5 | `int_quantite` | int | 10 | non |  | 0 |
| 6 | `int_pv_unitaire` | float | 53 | non |  | 0 |
| 7 | `int___reduction` | int | 10 | non |  | 0 |
| 8 | `int_supplement` | float | 53 | non |  | 0 |
| 9 | `int_montant` | float | 53 | non |  | 0 |
| 10 | `int_reservation__` | nvarchar | 1 | non |  | 0 |
| 11 | `int_date__excursion` | char | 8 | non |  | 0 |
| 12 | `int_heure_excursion` | char | 6 | non |  | 0 |
| 13 | `int_date_debut______` | char | 8 | non |  | 0 |
| 14 | `int_date_fin________` | char | 8 | non |  | 0 |
| 15 | `int_num_article` | int | 10 | non |  | 0 |
| 16 | `int_date_mouvement` | char | 8 | non |  | 0 |
| 17 | `int_heure_mouvement` | char | 6 | non |  | 0 |
| 18 | `int_num_facture` | int | 10 | non |  | 0 |
| 19 | `int_chrono` | int | 10 | non |  | 0 |
| 20 | `int_tva` | float | 53 | non |  | 0 |
| 21 | `int_code_vendeur` | int | 10 | non |  | 0 |
| 22 | `int_hostname` | nvarchar | 50 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| excuinte_dat_IDX_2 | NONCLUSTERED | oui | int_num_terminal, int_hostname, int_type, int_code, int_date_mouvement, int_heure_mouvement |
| excuinte_dat_IDX_1 | NONCLUSTERED | non | int_num_terminal, int_hostname |

