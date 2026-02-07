# moyens_reglement_complem

**Nom logique Magic** : `moyens_reglement_complem`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `mrc_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `mrc_devise` | nvarchar | 3 | non |  | 0 |
| 3 | `mrc_type_operation` | nvarchar | 1 | non |  | 0 |
| 4 | `mrc_mop` | nvarchar | 4 | non |  | 0 |
| 5 | `mrc_accepte` | nvarchar | 1 | non |  | 0 |
| 6 | `mrc_type_de_taux` | int | 10 | non |  | 0 |
| 7 | `mrc_taux_de_change` | float | 53 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| moyens_reglement_complem_IDX_1 | NONCLUSTERED | oui | mrc_societe, mrc_devise, mrc_type_operation, mrc_mop, mrc_type_de_taux |

