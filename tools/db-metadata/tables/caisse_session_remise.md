# caisse_session_remise

| Info | Valeur |
|------|--------|
| Lignes | 54 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `utilisateur` | nvarchar | 8 | non |  | 9 |
| 2 | `chrono_session` | float | 53 | non |  | 23 |
| 3 | `chrono_detail` | int | 10 | non |  | 3 |
| 4 | `type` | nvarchar | 1 | non |  | 1 |
| 5 | `quand` | nvarchar | 1 | non |  | 2 |
| 6 | `classe` | nvarchar | 6 | non |  | 4 |
| 7 | `mode_paiement` | nvarchar | 4 | non |  | 7 |
| 8 | `montant` | float | 53 | non |  | 45 |
| 9 | `date` | char | 8 | non |  | 10 |
| 10 | `heure` | char | 6 | non |  | 26 |

## Valeurs distinctes

### `utilisateur` (9 valeurs)

```
ARKON, BEAM, DOREEN, ESTELLE, FAM, GIFT, JULIA, MIND, PLANNING
```

### `chrono_session` (23 valeurs)

```
1293, 1294, 1295, 16, 17, 175, 177, 18, 2, 233, 234, 235, 32, 33, 34, 654, 797, 798, 799, 8, 885, 886, 887
```

### `chrono_detail` (3 valeurs)

```
5, 7, 8
```

### `type` (1 valeurs)

```
V
```

### `quand` (2 valeurs)

```
F, P
```

### `classe` (4 valeurs)

```
$CARD, $CASH, $PAPER, OD
```

### `mode_paiement` (7 valeurs)

```
ALIP, AMEX, BATR, Cash, OD, VISA, WECH
```

### `montant` (45 valeurs)

```
11345, 1190, 12300, 12662.6, 13860, 14584.2, 15000, 1800, 1830, 19000, 20230, 2100, 215, 2205, 22055, 24000, 25041, 25880.6, 2600, 2635, 26800, 27735, 28320, 2910, 3100, -32111.9, 335, 400, 420, 4495, 47220, 47491, 500, 5000, 5740, -5963, 63660, 800, 81390, 8400, 86962, 87, 91159, 93826.3, 94920
```

### `date` (10 valeurs)

```
20250619, 20251126, 20251128, 20251130, 20251219, 20251220, 20251221, 20251222, 20251223, 20251224
```

### `heure` (26 valeurs)

```
101727, 130642, 155722, 160420, 160559, 161601, 161940, 163201, 164600, 165504, 190813, 192212, 192311, 195023, 204347, 204724, 220747, 221915, 222527, 223850, 224121, 230313, 230451, 231143, 231513, 231849
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_session_remise_IDX_1 | NONCLUSTERED | oui | utilisateur, chrono_session, chrono_detail, classe, mode_paiement |

