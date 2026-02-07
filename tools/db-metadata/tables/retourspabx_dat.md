# retourspabx_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cor_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `cor_poste` | int | 10 | non |  | 0 |
| 3 | `cor_numero_ligne` | int | 10 | non |  | 0 |
| 4 | `cor_code_autocom` | int | 10 | non |  | 0 |
| 5 | `cor_sens` | nvarchar | 1 | non |  | 0 |
| 6 | `cor_valeur` | int | 10 | non |  | 0 |
| 7 | `cor_date` | char | 8 | non |  | 0 |
| 8 | `cor_heure` | char | 6 | non |  | 0 |
| 9 | `cor_libre` | nvarchar | 50 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| retourspabx_dat_IDX_1 | NONCLUSTERED | oui | cor_societe, cor_poste, cor_numero_ligne, cor_code_autocom, cor_sens |

