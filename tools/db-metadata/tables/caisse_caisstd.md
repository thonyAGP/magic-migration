# caisse_caisstd

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 11 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `hisuser` | nvarchar | 8 | non |  | 0 |
| 2 | `hisquand` | nvarchar | 1 | non |  | 0 |
| 3 | `hischronohisto` | float | 53 | non |  | 0 |
| 4 | `hisordre` | int | 10 | non |  | 0 |
| 5 | `histype` | nvarchar | 3 | non |  | 0 |
| 6 | `hislibelle` | nvarchar | 16 | non |  | 0 |
| 7 | `hisprixunitaire` | float | 53 | non |  | 0 |
| 8 | `hisquantite` | int | 10 | non |  | 0 |
| 9 | `hismontant` | float | 53 | non |  | 0 |
| 10 | `hisdatesaisie` | char | 8 | non |  | 0 |
| 11 | `hisheuresaisie` | char | 6 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_caisstd_IDX_1 | NONCLUSTERED | oui | hisuser, hisquand, hischronohisto, hisordre |

