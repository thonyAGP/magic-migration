# cafil191_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tpm_num_terminal` | int | 10 | non |  | 0 |
| 2 | `tpm_num_groupe` | int | 10 | non |  | 0 |
| 3 | `tpm_libelle` | nvarchar | 15 | non |  | 0 |
| 4 | `tpm_rechargement__` | nvarchar | 1 | non |  | 0 |
| 5 | `tpm_flag_collecte` | nvarchar | 1 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil191_dat_IDX_1 | NONCLUSTERED | oui | tpm_num_terminal |
| cafil191_dat_IDX_2 | NONCLUSTERED | non | tpm_num_groupe, tpm_num_terminal |
| cafil191_dat_IDX_3 | NONCLUSTERED | non | tpm_flag_collecte, tpm_num_terminal |

