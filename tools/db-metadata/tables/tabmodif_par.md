# tabmodif_par

| Info | Valeur |
|------|--------|
| Lignes | 62 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tam_langue` | nvarchar | 3 | non |  | 2 |
| 2 | `tam_code` | nvarchar | 2 | non |  | 31 |
| 3 | `tam_libelle` | nvarchar | 60 | non |  | 62 |

## Valeurs distinctes

### `tam_langue` (2 valeurs)

```
ANG, FRA
```

### `tam_code` (31 valeurs)

```
AA, AC, AE, AG, AN, AP, AR, AS, CE, CI, CP, EG, FD, M1, M5, MC, MF, MI, ML, MO, MQ, MT, MX, MZ, NC, PR, RT, TR, UA, UF, UP
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| tabmodif_par_IDX_1 | NONCLUSTERED | oui | tam_langue, tam_code |

