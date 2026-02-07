# transfert

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `trf_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `trf_compte` | int | 10 | non |  | 0 |
| 3 | `trf_filiation` | int | 10 | non |  | 0 |
| 4 | `trf_date` | char | 8 | non |  | 0 |
| 5 | `trf_heure` | char | 6 | non |  | 0 |
| 6 | `trf_code_aer` | nvarchar | 6 | non |  | 0 |
| 7 | `trf_vol` | nvarchar | 10 | non |  | 0 |
| 8 | `trf_commentaire` | nvarchar | 30 | non |  | 0 |
| 9 | `trf_type` | nvarchar | 2 | non |  | 0 |
| 10 | `trf_sens` | nvarchar | 1 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| transfert_IDX_1 | NONCLUSTERED | oui | trf_date, trf_sens, trf_heure, trf_societe, trf_compte, trf_filiation |

