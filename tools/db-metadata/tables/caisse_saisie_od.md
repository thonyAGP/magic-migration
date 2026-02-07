# caisse_saisie_od

| Info | Valeur |
|------|--------|
| Lignes | 8569 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `service` | nvarchar | 4 | non |  | 10 |
| 2 | `date_comptable` | char | 8 | non |  | 1381 |
| 3 | `montant` | float | 53 | non |  | 5195 |

## Valeurs distinctes

### `service` (10 valeurs)

```
BABY, BARD, BOUT, COMM, ESTH, EXCU, INFI, PHOT, REST, SPNA
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_saisie_od_IDX_1 | NONCLUSTERED | oui | service, date_comptable |
| caisse_saisie_od_IDX_2 | NONCLUSTERED | oui | date_comptable, service |

