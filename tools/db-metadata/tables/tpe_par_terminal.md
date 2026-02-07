# tpe_par_terminal

**Nom logique Magic** : `tpe_par_terminal`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tpt_num_terminal` | smallint | 5 | non |  | 0 |
| 2 | `tpt_interface` | bit |  | non |  | 0 |
| 3 | `tpt_num_tpe` | nvarchar | 20 | non |  | 0 |
| 4 | `tpt_type_tpe` | nvarchar | 5 | oui |  | 0 |
| 5 | `tpt_pcl_com` | nvarchar | 50 | oui |  | 0 |
| 6 | `tpt_hostname` | nvarchar | 50 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| tpe_par_terminal_IDX_1 | NONCLUSTERED | oui | tpt_num_terminal, tpt_hostname |

