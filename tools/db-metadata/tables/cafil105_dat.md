# cafil105_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cci_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `cci_code_circuit` | nvarchar | 6 | non |  | 0 |
| 3 | `cci_libelle` | nvarchar | 20 | non |  | 0 |
| 4 | `cci_date_debut` | char | 8 | non |  | 0 |
| 5 | `cci_heure_debut` | nvarchar | 2 | non |  | 0 |
| 6 | `cci_date_fin` | char | 8 | non |  | 0 |
| 7 | `cci_heure_fin` | nvarchar | 2 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil105_dat_IDX_2 | NONCLUSTERED | non | cci_societe, cci_code_circuit, cci_date_debut |
| cafil105_dat_IDX_1 | NONCLUSTERED | oui | cci_societe, cci_date_debut, cci_code_circuit |

