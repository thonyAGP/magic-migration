# log_affec_auto_detail

**Nom logique Magic** : `log_affec_auto_detail`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `laa_date_traitement` | char | 8 | non |  | 0 |
| 2 | `laa_date_debut_sejour` | char | 8 | non |  | 0 |
| 3 | `laa_compte` | int | 10 | non |  | 0 |
| 4 | `laa_filiation` | int | 10 | non |  | 0 |
| 5 | `laa_erreur` | nvarchar | 200 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_affec_auto_detail_IDX_1 | NONCLUSTERED | oui | laa_date_traitement, laa_date_debut_sejour, laa_compte, laa_filiation |

