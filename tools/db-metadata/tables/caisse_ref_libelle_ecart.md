# caisse_ref_libelle_ecart

| Info | Valeur |
|------|--------|
| Lignes | 7 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code` | int | 10 | non |  | 7 |
| 2 | `libelle_fra` | nvarchar | 64 | non |  | 7 |
| 3 | `libelle_ang` | nvarchar | 64 | non |  | 7 |

## Valeurs distinctes

### `code` (7 valeurs)

```
1, 2, 3, 4, 5, 6, 7
```

### `libelle_fra` (7 valeurs)

```
Carte crÃ©dit, Facturation / encaissement, OpÃ©ration de change, OpÃ©ration solde, OpÃ©ration sur autre login, Rendu monnaie, Saisie documents comptables
```

### `libelle_ang` (7 valeurs)

```
Accounting registration, Billing / Collection, Cash  refund, Check-out transaction, Credit card transaction, Exchange transaction, Transaction with another login
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_ref_libelle_ecart_IDX_1 | NONCLUSTERED | oui | code |

