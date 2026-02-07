# cafil138_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `bib_num_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `bib_code_adherent` | int | 10 | non |  | 0 |
| 3 | `bib_filiation` | int | 10 | non |  | 0 |
| 4 | `bib_num_bibop` | int | 10 | non |  | 0 |
| 5 | `bib_date_debut` | char | 8 | non |  | 0 |
| 6 | `bib_heure_debut` | char | 6 | non |  | 0 |
| 7 | `bib_date_fin` | char | 8 | non |  | 0 |
| 8 | `bib_heure_fin` | char | 6 | non |  | 0 |
| 9 | `bib_flag_utilise` | nvarchar | 1 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil138_dat_IDX_1 | NONCLUSTERED | oui | bib_num_societe, bib_code_adherent, bib_filiation |
| cafil138_dat_IDX_2 | NONCLUSTERED | oui | bib_num_bibop |

