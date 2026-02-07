# Export_Ucopia_Session

| Info | Valeur |
|------|--------|
| Lignes | 155 |
| Colonnes | 12 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `Session_Id` | float | 53 | non |  | 155 |
| 2 | `User_Id` | varchar | 255 | non |  | 155 |
| 3 | `Timestamp` | float | 53 | non |  | 153 |
| 4 | `Date_Alpha` | varchar | 255 | non |  | 153 |
| 5 | `Last_Name` | varchar | 255 | non |  | 134 |
| 6 | `First_Name` | varchar | 255 | non |  | 142 |
| 7 | `Field_Title_1` | varchar | 255 | non |  | 2 |
| 8 | `Field_Value_1` | varchar | 255 | non |  | 73 |
| 9 | `Field_Title_2` | varchar | 255 | non |  | 2 |
| 10 | `Field_Value_2` | varchar | 255 | non |  | 28 |
| 11 | `Email` | varchar | 255 | non |  | 1 |
| 12 | `Nationality` | varchar | 255 | non |  | 1 |

## Valeurs distinctes

### `Field_Title_1` (2 valeurs)

```
Datacaching, Room Number
```

### `Field_Title_2` (2 valeurs)

```
Datacaching, Room Number
```

### `Field_Value_2` (28 valeurs)

```
 , 13, 28, a1188, AA, D1254, G0001, J1296, K1212, M1102, M1105, M1106, M1107, M1204, O0001, O2102, O2109, O2202, O2205, P0001, p0002, R2317, RECEPTION, rn25014, T2248, W2518, X1641, x1650
```

### `Email` (1 valeurs)

```
 
```

### `Nationality` (1 valeurs)

```
 
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| Export_Ucopia_Session_IDX_1 | NONCLUSTERED | oui | User_Id, Timestamp, Session_Id |
| Export_Ucopia_Session_IDX_2 | NONCLUSTERED | oui | Email, User_Id, Timestamp |

