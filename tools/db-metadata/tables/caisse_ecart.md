# caisse_ecart

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 11 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono` | float | 53 | non |  | 0 |
| 2 | `date_comptable` | char | 8 | non |  | 0 |
| 3 | `date` | char | 8 | non |  | 0 |
| 4 | `heure` | char | 6 | non |  | 0 |
| 5 | `utilisateur` | nvarchar | 8 | non |  | 0 |
| 6 | `session` | float | 53 | non |  | 0 |
| 7 | `montant_compte` | float | 53 | non |  | 0 |
| 8 | `montant_calcule` | float | 53 | non |  | 0 |
| 9 | `montant_ecart` | float | 53 | non |  | 0 |
| 10 | `quand` | nvarchar | 1 | non |  | 0 |
| 11 | `commentaire_ecart` | nvarchar | 30 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_ecart_IDX_2 | NONCLUSTERED | non | date_comptable |
| caisse_ecart_IDX_3 | NONCLUSTERED | non | date |
| caisse_ecart_IDX_1 | NONCLUSTERED | oui | chrono |

