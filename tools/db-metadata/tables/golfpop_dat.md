# golfpop_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 17 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pog_type` | nvarchar | 1 | non |  | 0 |
| 2 | `pog_code` | int | 10 | non |  | 0 |
| 3 | `pog_libelle` | nvarchar | 20 | non |  | 0 |
| 4 | `pog_numero_article` | int | 10 | non |  | 0 |
| 5 | `pog_reservation__` | nvarchar | 1 | non |  | 0 |
| 6 | `pog_location__` | nvarchar | 1 | non |  | 0 |
| 7 | `pog_code_prestation` | nvarchar | 6 | non |  | 0 |
| 8 | `pog_nbre_places_1` | int | 10 | non |  | 0 |
| 9 | `pog_nbre_places_2` | int | 10 | non |  | 0 |
| 10 | `pog_nbre_places_3` | int | 10 | non |  | 0 |
| 11 | `pog_nbre_places_4` | int | 10 | non |  | 0 |
| 12 | `pog_nbre_places_5` | int | 10 | non |  | 0 |
| 13 | `pog_nbre_places_6` | int | 10 | non |  | 0 |
| 14 | `pog_nbre_places_7` | int | 10 | non |  | 0 |
| 15 | `pog_nbre_places_8` | int | 10 | non |  | 0 |
| 16 | `pog_quantite_saison` | int | 10 | non |  | 0 |
| 17 | `pog_montant_saison` | float | 53 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| golfpop_dat_IDX_3 | NONCLUSTERED | non | pog_type, pog_reservation__, pog_libelle |
| golfpop_dat_IDX_2 | NONCLUSTERED | non | pog_type, pog_libelle |
| golfpop_dat_IDX_1 | NONCLUSTERED | oui | pog_type, pog_code |

