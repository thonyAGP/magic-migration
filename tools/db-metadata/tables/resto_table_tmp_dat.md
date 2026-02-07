# resto_table_tmp_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `resto_id` | nvarchar | 5 | non |  | 0 |
| 2 | `date` | char | 8 | non |  | 0 |
| 3 | `section` | nvarchar | 1 | non |  | 0 |
| 4 | `table_id` | nvarchar | 3 | non |  | 0 |
| 5 | `nb_of_tables_free` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| resto_table_tmp_dat_IDX_1 | NONCLUSTERED | oui | resto_id, date, section, table_id |

