# taxe_add_vente

**Nom logique Magic** : `taxe_add_vente`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tav_id` | int | 10 | non |  | 0 |
| 2 | `tav_table` | char | 1 | non |  | 0 |
| 3 | `tav_service` | nvarchar | 4 | non |  | 0 |
| 4 | `tav_id_table` | int | 10 | non |  | 0 |
| 5 | `tav_taxe` | float | 53 | non |  | 0 |
| 6 | `tav_valeur` | decimal | 12,3 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| taxe_add_vente_IDX_1 | NONCLUSTERED | oui | tav_id |

