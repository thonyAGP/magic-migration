# presparn

| Info | Valeur |
|------|--------|
| Lignes | 116683 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `date` | char | 8 | non |  | 47663 |
| 2 | `nationality` | nvarchar | 2 | non |  | 45 |
| 3 | `number` | float | 53 | non |  | 808 |

## Valeurs distinctes

### `nationality` (45 valeurs)

```
, @@, AL, AR, AT, AU, BQ, BR, CD, CH, CL, CO, ES, FR, GB, HK, ID, IO, IR, IS, IT, JP, LB, MA, MO, MX, MY, NL, NZ, PI, PL, PO, RO, RU, SA, SG, SN, SU, TH, TR, TU, TW, UK, US, ZA
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| presparn_IDX_2 | NONCLUSTERED | oui | nationality, date |
| presparn_IDX_1 | NONCLUSTERED | oui | date, nationality |

