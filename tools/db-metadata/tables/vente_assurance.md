# vente_assurance

**Nom logique Magic** : `vente_assurance`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `vas_table_vente` | nvarchar | 1 | non |  | 0 |
| 2 | `vas_id_table_vente` | float | 53 | non |  | 0 |
| 3 | `vas_pv_service` | nvarchar | 4 | non |  | 0 |
| 4 | `vas_email` | nvarchar | 192 | non |  | 0 |
| 5 | `vas_raison_id` | nvarchar | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| vente_assurance_IDX_1 | NONCLUSTERED | oui | vas_table_vente, vas_id_table_vente, vas_pv_service |

