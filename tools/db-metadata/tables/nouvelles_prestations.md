# nouvelles_prestations

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `nop_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `nop_prestation` | nvarchar | 6 | non |  | 0 |
| 3 | `nop_lib_prestation` | nvarchar | 30 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| prestnew_dat_IDX_1 | NONCLUSTERED | oui | nop_societe, nop_prestation |

