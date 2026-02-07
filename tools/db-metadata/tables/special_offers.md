# special_offers

**Nom logique Magic** : `special_offers`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `spo_num_dossier` | float | 53 | non |  | 0 |
| 2 | `spo_num_adherent` | float | 53 | non |  | 0 |
| 3 | `spo_num_filiation` | int | 10 | non |  | 0 |
| 4 | `spo_message` | nvarchar | 400 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| special_offers_IDX_1 | NONCLUSTERED | oui | spo_num_dossier, spo_num_adherent, spo_num_filiation |

