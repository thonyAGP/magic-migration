# cafil010_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 0 |
| 2 | `numero_de_compte` | int | 10 | non |  | 0 |
| 3 | `filiation` | int | 10 | non |  | 0 |
| 4 | `code_prestation` | nvarchar | 6 | non |  | 0 |
| 5 | `date_debut` | char | 8 | non |  | 0 |
| 6 | `date_fin` | char | 8 | non |  | 0 |
| 7 | `montant` | float | 53 | non |  | 0 |
| 8 | `flag_etat_prestation` | nvarchar | 1 | non |  | 0 |
| 9 | `numero_commentaire` | int | 10 | non |  | 0 |
| 10 | `termine__o_n_` | nvarchar | 1 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil010_dat_IDX_1 | NONCLUSTERED | oui | societe, numero_de_compte, filiation, code_prestation |

