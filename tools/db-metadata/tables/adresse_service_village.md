# adresse_service_village

**Nom logique Magic** : `adresse_service_village`

| Info | Valeur |
|------|--------|
| Lignes | 22 |
| Colonnes | 13 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `service` | nvarchar | 4 | non |  | 22 |
| 2 | `identification` | nvarchar | 3 | non |  | 1 |
| 3 | `club` | nvarchar | 128 | non |  | 3 |
| 4 | `village` | nvarchar | 128 | non |  | 1 |
| 5 | `adress_1` | nvarchar | 128 | non |  | 1 |
| 6 | `adress_2` | nvarchar | 128 | non |  | 3 |
| 7 | `adress_3` | nvarchar | 128 | non |  | 1 |
| 8 | `zip_city` | nvarchar | 128 | non |  | 2 |
| 9 | `phone` | nvarchar | 128 | non |  | 3 |
| 10 | `fax` | nvarchar | 128 | non |  | 2 |
| 11 | `siret` | nvarchar | 128 | non |  | 2 |
| 12 | `tva_number` | nvarchar | 128 | non |  | 3 |
| 13 | `email` | nvarchar | 128 | non |  | 6 |

## Valeurs distinctes

### `service` (22 valeurs)

```
, ARZA, AUT1, BABY, BARD, BOUT, CAIS, CMAF, COMM, ESTH, EXCU, GEST, INFI, MINI, PHOT, PLAN, PRES, REST, SPNA, SPTE, STAN, TRAF
```

### `identification` (1 valeurs)

```
116
```

### `club` (3 valeurs)

```
, Phuket, TAX INVOICE (ABB)
```

### `village` (1 valeurs)

```
HOLIDAY VILLAGES
```

### `adress_1` (1 valeurs)

```
(Thailand) Co.,Ltd.
```

### `adress_2` (3 valeurs)

```
, 3 Kata Road-Karon Sub District, 3 Kata Road-Karon, Muang
```

### `adress_3` (1 valeurs)

```
Mueng District - Phuket 83100
```

### `zip_city` (2 valeurs)

```
, Phuket 83100 Thailand
```

### `phone` (3 valeurs)

```
, (66) 763 304 45, 66 76 330 455
```

### `fax` (2 valeurs)

```
, 66 76 330461
```

### `siret` (2 valeurs)

```
, TAX ID NO.0-1055-27003-03-8
```

### `tva_number` (3 valeurs)

```
, 0-1055-27003-03-8, 01-055-27-00-3038
```

### `email` (6 valeurs)

```
, BRANCH 00001, Phuccbar01@clubmed.com, phucfitn01@clubmed.com, phuckitc03@clubmed.com, www.clubmed.co.th
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| adresse_service_IDX1 | NONCLUSTERED | oui | service |

