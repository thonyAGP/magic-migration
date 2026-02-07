# caisse_epusaison

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `numero` | int | 10 | non |  | 0 |
| 2 | `nomfichier` | nvarchar | 64 | non |  | 0 |
| 3 | `flag` | bit |  | non |  | 0 |
| 4 | `numero_caissefs` | int | 10 | non |  | 0 |
| 5 | `a_supprimer_ou_purger` | bit |  | non |  | 0 |
| 6 | `buffer` | nvarchar | 58 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_epusaison_IDX_1 | NONCLUSTERED | oui | numero |

