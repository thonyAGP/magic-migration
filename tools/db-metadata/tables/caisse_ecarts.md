# caisse_ecarts

| Info | Valeur |
|------|--------|
| Lignes | 1107 |
| Colonnes | 12 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono` | float | 53 | non |  | 1107 |
| 2 | `date_comptable` | char | 8 | non |  | 574 |
| 3 | `date` | char | 8 | non |  | 573 |
| 4 | `heure` | char | 6 | non |  | 1079 |
| 5 | `utilisateur` | nvarchar | 8 | non |  | 20 |
| 6 | `session` | float | 53 | non |  | 474 |
| 7 | `montant_compte` | float | 53 | non |  | 1085 |
| 8 | `montant_calcule` | float | 53 | non |  | 1105 |
| 9 | `montant_ecart` | float | 53 | non |  | 227 |
| 10 | `quand` | nvarchar | 1 | non |  | 1 |
| 11 | `commentaire_ecart` | nvarchar | 30 | non |  | 8 |
| 12 | `commentaire_gestion` | nvarchar | 60 | non |  | 1 |

## Valeurs distinctes

### `utilisateur` (20 valeurs)

```
APPLE, ARKON, ASSTFAM, AUNKO, BATU, BEAM, EVE, GIFT, ING, JAA, JAA1, JOY, JULIA, MICKY, MIMI, MIND, PEPSI, REMI, TEMMY, TIK
```

### `quand` (1 valeurs)

```
F
```

### `commentaire_ecart` (8 valeurs)

```
Accounting registration, Billing / Collection, Cash  refund, Check-out transaction, Credit card transaction, Exchange transaction, Rendu monnaie, Transaction with another login
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_ecarts_IDX_2 | NONCLUSTERED | non | date_comptable |
| caisse_ecarts_IDX_3 | NONCLUSTERED | non | date |
| caisse_ecarts_IDX_1 | NONCLUSTERED | oui | chrono |

