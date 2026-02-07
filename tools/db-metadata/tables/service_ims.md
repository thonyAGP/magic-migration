# service_ims

| Info | Valeur |
|------|--------|
| Lignes | 134 |
| Colonnes | 2 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ims_num_terminal` | int | 10 | non |  | 134 |
| 2 | `ims_code_service` | nvarchar | 4 | non |  | 21 |

## Valeurs distinctes

### `ims_code_service` (21 valeurs)

```
AUT1, AUT2, AUT3, BABY, BARD, BOUT, COIF, COMM, EQUI, ESTH, EXCU, GOLF, INFI, MINI, PHOT, PRES, REST, SKIN, SPNA, SPTE, TENN
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| service_ims_IDX_1 | NONCLUSTERED | oui | ims_num_terminal, ims_code_service |
| service_ims_IDX_2 | NONCLUSTERED | oui | ims_code_service, ims_num_terminal |

