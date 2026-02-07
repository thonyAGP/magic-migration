# ticket_odyssey_addon

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 5 |
| Clef primaire | TOA_ID |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `TOA_ID` | bigint | 19 | non | PK | 1 |
| 2 | `ODYSSEY_ID` | nvarchar | 100 | oui |  | 1 |
| 3 | `ROOM_NUMBER` | nvarchar | 6 | oui |  | 0 |
| 4 | `TIME_LCO` | char | 4 | oui |  | 0 |
| 5 | `TOA_STAY_ID` | bigint | 19 | oui |  | 1 |

## Valeurs distinctes

### `TOA_ID` (1 valeurs)

```
341
```

### `ODYSSEY_ID` (1 valeurs)

```
ARKON2354395300ALIP1766319756552
```

### `TOA_STAY_ID` (1 valeurs)

```
2354395300
```

