# caisse_cloture

| Info | Valeur |
|------|--------|
| Lignes | 1564 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono` | float | 53 | non |  | 1564 |
| 2 | `date_debut_cloture` | char | 8 | non |  | 1564 |
| 3 | `heure_debut_cloture` | char | 6 | non |  | 638 |
| 4 | `date_fin_cloture` | char | 8 | non |  | 1564 |
| 5 | `heure_fin_cloture` | char | 6 | non |  | 656 |
| 6 | `libre` | nvarchar | 96 | non |  | 1 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_cloture_IDX_1 | NONCLUSTERED | oui | chrono |

