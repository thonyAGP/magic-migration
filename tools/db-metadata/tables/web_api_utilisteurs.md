# web_api_utilisteurs

| Info | Valeur |
|------|--------|
| Lignes | 2 |
| Colonnes | 6 |
| Clef primaire | Id |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `Id` | int | 10 | non | PK | 2 |
| 2 | `ClientId` | int | 10 | non |  | 2 |
| 3 | `LastName` | nvarchar | 100 | oui |  | 1 |
| 4 | `FirstName` | nvarchar | 100 | oui |  | 0 |
| 5 | `UserName` | nvarchar | 100 | non |  | 2 |
| 6 | `Password` | nvarchar | 100 | non |  | 2 |

## Valeurs distinctes

### `Id` (2 valeurs)

```
1, 2
```

### `ClientId` (2 valeurs)

```
1, 2
```

### `LastName` (1 valeurs)

```
OpenBravo
```

### `UserName` (2 valeurs)

```
digby_winebyglass@clubmed.com, openbravo_boutique@clubmed.com
```

### `Password` (2 valeurs)

```
5lMXn@zC26iX, s%y)v6dqtTBN
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| IDX1_web_api_utilisteurs | NONCLUSTERED | oui | UserName |

