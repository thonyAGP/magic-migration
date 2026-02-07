# caisse_ref_activite_service_old

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 0 |
| 2 | `activite_du_plan_comptable` | int | 10 | non |  | 0 |
| 3 | `service_de_pms` | nvarchar | 4 | non |  | 0 |
| 4 | `compte_de_charge___not_used` | bit |  | non |  | 0 |
| 5 | `compte_de_bilan___not_used` | bit |  | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_ref_activite_service_old_IDX_2 | NONCLUSTERED | oui | societe, service_de_pms, activite_du_plan_comptable |
| caisse_ref_activite_service_old_IDX_1 | NONCLUSTERED | oui | societe, activite_du_plan_comptable, service_de_pms |

