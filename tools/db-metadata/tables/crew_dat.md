# crew_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 28 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 0 |
| 2 | `numero_compte` | int | 10 | non |  | 0 |
| 3 | `filiation` | int | 10 | non |  | 0 |
| 4 | `n_secu` | float | 53 | non |  | 0 |
| 5 | `crew_name` | nvarchar | 13 | non |  | 0 |
| 6 | `crew_1st_n` | nvarchar | 10 | non |  | 0 |
| 7 | `sex` | nvarchar | 1 | non |  | 0 |
| 8 | `fonction` | nvarchar | 15 | non |  | 0 |
| 9 | `nationalite` | nvarchar | 12 | non |  | 0 |
| 10 | `birth_date` | char | 8 | non |  | 0 |
| 11 | `birth_place` | nvarchar | 12 | non |  | 0 |
| 12 | `passport_n` | nvarchar | 14 | non |  | 0 |
| 13 | `issued_date` | char | 8 | non |  | 0 |
| 14 | `issued_pla` | nvarchar | 20 | non |  | 0 |
| 15 | `tv` | nvarchar | 3 | non |  | 0 |
| 16 | `radio` | nvarchar | 3 | non |  | 0 |
| 17 | `walkman` | nvarchar | 3 | non |  | 0 |
| 18 | `camera` | nvarchar | 3 | non |  | 0 |
| 19 | `video` | nvarchar | 3 | non |  | 0 |
| 20 | `cigarettes` | nvarchar | 3 | non |  | 0 |
| 21 | `alcohol` | nvarchar | 3 | non |  | 0 |
| 22 | `other` | nvarchar | 3 | non |  | 0 |
| 23 | `engaged` | nvarchar | 11 | non |  | 0 |
| 24 | `disembark` | nvarchar | 1 | non |  | 0 |
| 25 | `shipped` | char | 8 | non |  | 0 |
| 26 | `employment` | nvarchar | 10 | non |  | 0 |
| 27 | `end_pass` | char | 8 | non |  | 0 |
| 28 | `end_visa` | char | 8 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| crew_dat_IDX_1 | NONCLUSTERED | oui | societe, numero_compte, filiation |
| crew_dat_IDX_2 | NONCLUSTERED | oui | societe, n_secu |

