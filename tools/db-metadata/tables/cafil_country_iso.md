# cafil_country_iso

**Nom logique Magic** : `cafil_country_iso`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `Code_ISO` | nvarchar | 8 | non |  | 0 |
| 2 | `Code_geographique` | nvarchar | 3 | non |  | 0 |
| 3 | `Libelle_FRE` | nvarchar | 30 | non |  | 0 |
| 4 | `Libelle_ANG` | nvarchar | 30 | non |  | 0 |
| 5 | `Langue_parlee` | nvarchar | 3 | non |  | 0 |
| 6 | `Monnaie` | nvarchar | 4 | non |  | 0 |
| 7 | `Code_telephone` | int | 10 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil_country_iso_IDX_1 | NONCLUSTERED | oui | Code_ISO |

