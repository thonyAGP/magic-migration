# moyen_paiement_complement

**Nom logique Magic** : `moyen_paiement_complement`

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `mpc_societe` | nvarchar | 1 | non |  | 0 |
| 2 | `mpc_mop` | nvarchar | 5 | non |  | 0 |
| 3 | `mpc_coef_marge_achat` | float | 53 | non |  | 0 |
| 4 | `mpc_coef_marge_achat_in` | float | 53 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| moyen_paiement_complement_IDX_1 | NONCLUSTERED | oui | mpc_societe, mpc_mop |

