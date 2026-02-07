# cafil147_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `sse_salle` | nvarchar | 20 | non |  | 0 |
| 2 | `sse_poste` | nvarchar | 6 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil147_dat_IDX_2 | NONCLUSTERED | oui | sse_poste |
| cafil147_dat_IDX_1 | NONCLUSTERED | oui | sse_salle, sse_poste |

