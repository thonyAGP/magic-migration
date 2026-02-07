# num_tpe_par_service

**Nom logique Magic** : `num_tpe_par_service`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tps_service` | nvarchar | 4 | non |  | 0 |
| 2 | `tps_num_debut` | smallint | 5 | non |  | 0 |
| 3 | `tps_num_fin` | smallint | 5 | non |  | 0 |
| 4 | `tps_terminal_debut` | smallint | 5 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| num_tpe_par_service_IDX_1 | NONCLUSTERED | oui | tps_service |

