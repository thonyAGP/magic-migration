# web_api_logs

**Nom logique Magic** : `web_api_logs`

| Info | Valeur |
|------|--------|
| Lignes | 61614 |
| Colonnes | 8 |
| Clef primaire | IdLog |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `IdLog` | bigint | 19 | non | PK | 61614 |
| 2 | `UserLog` | int | 10 | oui |  | 2 |
| 3 | `UrlLog` | nvarchar | 200 | oui |  | 980 |
| 4 | `DateLog` | datetime |  | oui |  | 48995 |
| 5 | `ErrorLog` | bit |  | oui |  | 2 |
| 6 | `ErrorMsgLog` | nvarchar | MAX | oui |  | 447 |
| 7 | `JsonInLog` | varbinary | MAX | oui |  | 8658 |
| 8 | `JsonOutLog` | varbinary | MAX | oui |  | 6869 |

## Valeurs distinctes

### `UserLog` (2 valeurs)

```
0, 1
```

### `ErrorLog` (2 valeurs)

```
0, 1
```

