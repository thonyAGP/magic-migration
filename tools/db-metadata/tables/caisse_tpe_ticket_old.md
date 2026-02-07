# caisse_tpe_ticket_old

| Info | Valeur |
|------|--------|
| Lignes | 0 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `old_numero_tpe` | int | 10 | non |  | 0 |
| 2 | `old_date_comptable` | char | 8 | non |  | 0 |
| 3 | `old_moyen_de_paiement` | nvarchar | 4 | non |  | 0 |
| 4 | `old_ordre_saisie` | int | 10 | non |  | 0 |
| 5 | `old_montant` | float | 53 | non |  | 0 |
| 6 | `old_numero_remise` | nvarchar | 32 | non |  | 0 |
## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_tpe_ticket_old_IDX_2 | NONCLUSTERED | oui | old_date_comptable, old_numero_tpe, old_ordre_saisie |
| caisse_tpe_ticket_old_IDX_1 | NONCLUSTERED | oui | old_numero_tpe, old_date_comptable, old_moyen_de_paiement |

