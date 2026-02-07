# caisse_compcais_histo

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 14 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `_hisuser` | nvarchar | 8 | non |  | 0 |
| 2 | `_hisquand` | nvarchar | 1 | non |  | 0 |
| 3 | `_hischronohisto` | float | 53 | non |  | 0 |
| 4 | `_hisordre` | int | 10 | non |  | 0 |
| 5 | `_histype` | nvarchar | 3 | non |  | 0 |
| 6 | `_hislibelle` | nvarchar | 16 | non |  | 0 |
| 7 | `_hisprixunitaire` | float | 53 | non |  | 0 |
| 8 | `_hisquantite` | int | 10 | non |  | 0 |
| 9 | `_hismontant` | float | 53 | non |  | 0 |
| 10 | `_hisdatesaisie` | char | 8 | non |  | 0 |
| 11 | `_hisheuresaisie` | char | 6 | non |  | 0 |
| 12 | `_hischronosession` | float | 53 | non |  | 0 |
| 13 | `_hiscodearticle` | int | 10 | non |  | 0 |
| 14 | `_hiszoom` | nvarchar | 4 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_compcais_histo_IDX_1 | NONCLUSTERED | oui | _hisuser, _hischronohisto, _hisordre |
| caisse_compcais_histo_IDX_2 | NONCLUSTERED | non | _hisuser, _hischronosession, _histype, _hischronohisto |

