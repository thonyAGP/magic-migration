# password_historique

**Nom logique Magic** : `password_historique`

| Info | Valeur |
|------|--------|
| Lignes | 197 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pwh_utilisateur` | nvarchar | 8 | non |  | 95 |
| 2 | `pwh_date_activation` | char | 8 | non |  | 122 |
| 3 | `pwh_heure_activation` | char | 6 | non |  | 163 |
| 4 | `pwh_password` | nvarchar | 64 | oui |  | 144 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| password_historique_IDX_1 | NONCLUSTERED | oui | pwh_utilisateur, pwh_date_activation, pwh_heure_activation, pwh_password |

