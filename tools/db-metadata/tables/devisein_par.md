# devisein_par

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_devise` | nvarchar | 4 | non |  | 0 |
| 2 | `libelle` | nvarchar | 20 | non |  | 0 |
| 3 | `nombre_de_decimales` | int | 10 | non |  | 0 |
| 4 | `taux` | float | 53 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| devisein_par_IDX_1 | NONCLUSTERED | oui | code_devise |

