# test_caisse_vente_par_mop

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 0 |
| 2 | `date_comptable` | char | 8 | non |  | 0 |
| 3 | `service` | nvarchar | 4 | non |  | 0 |
| 4 | `mop` | nvarchar | 4 | non |  | 0 |
| 5 | `montant_calcule` | float | 53 | non |  | 0 |
| 6 | `montant_saisi` | float | 53 | non |  | 0 |
| 7 | `ecart` | bit |  | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| test_caisse_vente_par_mop_IDX_1 | NONCLUSTERED | oui | societe, date_comptable, service, mop |

