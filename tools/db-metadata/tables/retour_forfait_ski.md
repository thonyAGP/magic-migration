# retour_forfait_ski

**Nom logique Magic** : `retour_forfait_ski`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 19 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `rfs_code_saison` | nvarchar | 1 | non |  | 0 |
| 2 | `rfs_date_retour` | char | 8 | non |  | 0 |
| 3 | `rfs_nb_forfait_demi_journee` | smallint | 5 | non |  | 0 |
| 4 | `rfs_nb_forfait_1jour` | smallint | 5 | non |  | 0 |
| 5 | `rfs_nb_forfait_2jours` | smallint | 5 | non |  | 0 |
| 6 | `rfs_nb_forfait_3jours` | smallint | 5 | non |  | 0 |
| 7 | `rfs_nb_forfait_4jours` | smallint | 5 | non |  | 0 |
| 8 | `rfs_nb_forfait_5jours` | smallint | 5 | non |  | 0 |
| 9 | `rfs_nb_forfait_6jours` | smallint | 5 | non |  | 0 |
| 10 | `rfs_nb_forfait_7jours` | smallint | 5 | non |  | 0 |
| 11 | `rfs_nb_forfait_8jours` | smallint | 5 | non |  | 0 |
| 12 | `rfs_nb_forfait_9jours` | smallint | 5 | non |  | 0 |
| 13 | `rfs_nb_forfait_10jours` | smallint | 5 | non |  | 0 |
| 14 | `rfs_nb_forfait_11jours` | smallint | 5 | non |  | 0 |
| 15 | `rfs_nb_forfait_12jours` | smallint | 5 | non |  | 0 |
| 16 | `rfs_nb_forfait_13jours` | smallint | 5 | non |  | 0 |
| 17 | `rfs_nb_forfait_14jours` | smallint | 5 | non |  | 0 |
| 18 | `rfs_nb_forfait_15jours` | smallint | 5 | non |  | 0 |
| 19 | `rfs_nb_forfait_total_journee` | smallint | 5 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| retour_forfait_ski_IDX1 | NONCLUSTERED | oui | rfs_code_saison, rfs_date_retour |

