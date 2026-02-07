# mdatagram_dat

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 16 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `gms_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `gms_code_gm` | int | 10 | non |  | 0 |
| 3 | `gms_filiation_villag` | int | 10 | non |  | 0 |
| 4 | `gms_acces` | nvarchar | 1 | non |  | 0 |
| 5 | `gms_type_de_client` | nvarchar | 1 | non |  | 0 |
| 6 | `gms_num__club` | float | 53 | non |  | 0 |
| 7 | `gms_lettre_controle` | nvarchar | 1 | non |  | 0 |
| 8 | `gms_filiation_club` | int | 10 | non |  | 0 |
| 9 | `gms_nom__30_` | nvarchar | 30 | non |  | 0 |
| 10 | `gms_prenom__8_` | nvarchar | 8 | non |  | 0 |
| 11 | `gms_qualite` | nvarchar | 2 | non |  | 0 |
| 12 | `gms_sexe` | nvarchar | 1 | non |  | 0 |
| 13 | `gms_debut_sejour` | char | 8 | non |  | 0 |
| 14 | `gms_fin_sejour` | char | 8 | non |  | 0 |
| 15 | `gms_envoie_interface` | bit |  | non |  | 0 |
| 16 | `gms_nbre_envoie` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| mdatagram_dat_IDX_2 | NONCLUSTERED | non | gms_envoie_interface, gms_nbre_envoie |
| mdatagram_dat_IDX_1 | NONCLUSTERED | oui | gms_societe, gms_code_gm, gms_filiation_villag |

