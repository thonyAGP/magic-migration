# log_util_pms

**Nom logique Magic** : `log_util_pms`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 11 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `lup_id` | int | 10 | non |  | 0 |
| 2 | `lup_login` | nvarchar | 10 | non |  | 0 |
| 3 | `lup_date_debut` | char | 8 | non |  | 0 |
| 4 | `lup_heure_debut` | char | 6 | non |  | 0 |
| 5 | `lup_rup_id` | int | 10 | non |  | 0 |
| 6 | `lup_commentaire` | nvarchar | 1024 | oui |  | 0 |
| 7 | `lup_info_add` | nvarchar | 1024 | non |  | 0 |
| 8 | `lup_hostname` | nvarchar | 10 | non |  | 0 |
| 9 | `lup_terminal` | smallint | 5 | non |  | 0 |
| 10 | `lup_date_fin` | char | 8 | oui |  | 0 |
| 11 | `lup_heure_fin` | char | 6 | oui |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_util_pms_IDX_2 | NONCLUSTERED | non | lup_date_debut |
| log_util_pms_IDX_1 | NONCLUSTERED | oui | lup_id |

