# annulation_adhts_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `arr_type_client` | nvarchar | 1 | non |  | 0 |
| 2 | `arr_num_adherent` | float | 53 | non |  | 0 |
| 3 | `arr_filiation_club` | smallint | 5 | non |  | 0 |
| 4 | `arr_num_dossier` | int | 10 | non |  | 0 |
| 5 | `arr_num_ordre` | smallint | 5 | non |  | 0 |
| 6 | `arr_debut_sejour` | char | 8 | non |  | 0 |
| 7 | `arr_suppression` | bit |  | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| annulation_adhts_dat_IDX_1 | NONCLUSTERED | oui | arr_num_dossier, arr_num_ordre |
| annulation_adhts_dat_IDX_2 | NONCLUSTERED | non | arr_suppression |

