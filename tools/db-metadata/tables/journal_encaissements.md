# journal_encaissements

**Nom logique Magic** : `journal_encaissements`

| Info | Valeur |
|------|--------|
| Lignes | 9028 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `joe_date_comptable` | char | 8 | non |  | 1988 |
| 2 | `joe_mode_de_paiement` | nvarchar | 4 | non |  | 10 |
| 3 | `joe_montant_ht` | float | 53 | non |  | 8473 |
| 4 | `joe_montant_ttc` | float | 53 | non |  | 8148 |

## Valeurs distinctes

### `joe_mode_de_paiement` (10 valeurs)

```
ALIP, AMEX, BATR, CASH, CCAU, CHQ, OD, UNIO, VISA, WECH
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| journal_encaissements_IDX_2 | NONCLUSTERED | oui | joe_mode_de_paiement, joe_date_comptable |
| journal_encaissements_IDX_1 | NONCLUSTERED | oui | joe_date_comptable, joe_mode_de_paiement |

