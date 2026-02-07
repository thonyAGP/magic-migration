# pays_iso

**Nom logique Magic** : `pays_iso`

| Info | Valeur |
|------|--------|
| Lignes | 247 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pay_code_pays_iso_alpha2` | nvarchar | 2 | non |  | 247 |
| 2 | `pay_code_pays_iso_alpha3` | nvarchar | 3 | non |  | 247 |
| 3 | `pay_code_pays_iso_numerique` | smallint | 5 | non |  | 247 |
| 4 | `pay_libelle_pays_fr` | nvarchar | 50 | non |  | 247 |
| 5 | `pay_libelle_pays_en` | nvarchar | 50 | non |  | 247 |
| 6 | `pay_code_pays_turquie` | nvarchar | 10 | non |  | 215 |
| 7 | `pay_code_pays_bresil` | nvarchar | 10 | non |  | 212 |
| 8 | `pay_code_pays_italie` | nvarchar | 10 | non |  | 203 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pays_iso_IDX_1 | NONCLUSTERED | oui | pay_code_pays_iso_alpha2 |

