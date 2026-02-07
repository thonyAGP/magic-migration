# logement_equipement

**Nom logique Magic** : `logement_equipement`

| Info | Valeur |
|------|--------|
| Lignes | 36 |
| Colonnes | 12 |
| Clef primaire | RowId_924 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `loe_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `loe_code_chambre` | nvarchar | 6 | non |  | 36 |
| 3 | `loe_type_equipement` | nvarchar | 10 | non |  | 1 |
| 4 | `RowId_924` | int | 10 | non | PK | 36 |
| 5 | `loe_code_equipement` | nvarchar | 10 | non |  | 1 |
| 6 | `loe_age_max` | smallint | 5 | non |  | 1 |
| 7 | `loe_longueur` | smallint | 5 | non |  | 1 |
| 8 | `loe_note` | nvarchar | 5 | non |  | 1 |
| 9 | `loe_largeur` | smallint | 5 | non |  | 2 |
| 10 | `loe_unite_equipement` | nvarchar | 1 | non |  | 1 |
| 11 | `loe_zippable` | bit |  | non |  | 1 |
| 12 | `loe_etat_zippe` | bit |  | non |  | 1 |

## Valeurs distinctes

### `loe_societe` (1 valeurs)

```
C
```

### `loe_code_chambre` (36 valeurs)

```
A1176, A1178, A1179, A1263, A1265, A1266, B1161, B1162, B1164, B1165, B1167, B1168, B1170, B1174, B1258, B1260, E1241, G1310, G1311, H1117, K1303, M1301, M1302, N2101, N2201, O2106, O2301, O2304, P2305, P2306, Q2117, S2229, S2314, S2315, T2238, T2316
```

### `loe_type_equipement` (1 valeurs)

```
LIT
```

### `RowId_924` (36 valeurs)

```
1, 10, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 3, 30, 31, 32, 33, 34, 35, 36, 37, 38, 4, 40, 41, 42, 43, 7, 9
```

### `loe_code_equipement` (1 valeurs)

```
KING
```

### `loe_age_max` (1 valeurs)

```
0
```

### `loe_longueur` (1 valeurs)

```
200
```

### `loe_largeur` (2 valeurs)

```
0, 200
```

### `loe_unite_equipement` (1 valeurs)

```
c
```

### `loe_zippable` (1 valeurs)

```
0
```

### `loe_etat_zippe` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| logement_equipement_IDX_1 | NONCLUSTERED | oui | loe_societe, loe_code_chambre, loe_type_equipement, loe_code_equipement, RowId_924 |

