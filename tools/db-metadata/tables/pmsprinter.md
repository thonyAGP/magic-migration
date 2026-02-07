# pmsprinter

| Info | Valeur |
|------|--------|
| Lignes | 9 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono` | int | 10 | non |  | 9 |
| 2 | `libelle` | nvarchar | 64 | non |  | 9 |
| 3 | `bac` | int | 10 | non |  | 3 |

## Valeurs distinctes

### `chrono` (9 valeurs)

```
1, 2, 3, 4, 5, 6, 7, 8, 9
```

### `libelle` (9 valeurs)

```
A4 or LETTER Bac 1, A4 or LETTER Bac 2, A5 Bac 1, A5 Bac 2, TMT88 II / III SERIAL, TMT88 IV USB, TMU 950 Cut SERIAL, TMU 950 Slip SERIAL, ZEBRA TLP2824
```

### `bac` (3 valeurs)

```
0, 1, 2
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pmsprinter_IDX_1 | NONCLUSTERED | oui | chrono |

