# anoecriture

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ano_table` | int | 10 | non |  | 0 |
| 2 | `ano_compte_gm` | int | 10 | non |  | 0 |
| 3 | `ano_numero_chrono` | int | 10 | non |  | 0 |
| 4 | `ano_montant` | float | 53 | non |  | 0 |
| 5 | `ano_date_comptable` | char | 8 | non |  | 0 |
| 6 | `ano_date_d_operation` | char | 8 | non |  | 0 |
| 7 | `ano_heure_operation` | char | 6 | non |  | 0 |
| 8 | `ano_operateur` | nvarchar | 8 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| anoecriture_IDX_1 | NONCLUSTERED | oui | ano_table, ano_compte_gm, ano_date_d_operation, ano_heure_operation |

