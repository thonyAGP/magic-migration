# cafil115_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 12 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 0 |
| 2 | `numero_compte` | int | 10 | non |  | 0 |
| 3 | `filiation` | int | 10 | non |  | 0 |
| 4 | `tva` | float | 53 | non |  | 0 |
| 5 | `taxe_ht_brute` | float | 53 | non |  | 0 |
| 6 | `nombre_de_taxes` | int | 10 | non |  | 0 |
| 7 | `numero_appele` | nvarchar | 23 | non |  | 0 |
| 8 | `date_appel` | char | 8 | non |  | 0 |
| 9 | `heure_appel` | char | 6 | non |  | 0 |
| 10 | `duree_appel` | char | 6 | non |  | 0 |
| 11 | `coefficient_club` | float | 53 | non |  | 0 |
| 12 | `montant_ttc_net` | float | 53 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil115_dat_IDX_2 | NONCLUSTERED | non | societe, numero_compte, filiation, tva |
| cafil115_dat_IDX_3 | NONCLUSTERED | oui | societe, numero_compte, filiation, date_appel, heure_appel |
| cafil115_dat_IDX_1 | NONCLUSTERED | non | societe, numero_compte, filiation, date_appel, tva |

