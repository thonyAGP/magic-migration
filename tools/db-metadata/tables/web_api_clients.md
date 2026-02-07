# web_api_clients

| Info | Valeur |
|------|--------|
| Lignes | 2 |
| Colonnes | 4 |
| Clef primaire | Id |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `Id` | int | 10 | non | PK | 2 |
| 2 | `Name` | nvarchar | 100 | oui |  | 2 |
| 3 | `Account` | nvarchar | 200 | oui |  | 2 |
| 4 | `Adresse` | nvarchar | 500 | oui |  | 0 |

## Valeurs distinctes

### `Id` (2 valeurs)

```
1, 2
```

### `Name` (2 valeurs)

```
Digby, OpenBravo
```

### `Account` (2 valeurs)

```
Digby, OpenBravo
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| IDX1_web_api_clients | NONCLUSTERED | oui | Account |
| IDX1_web_api_roles | NONCLUSTERED | oui | Name |

