# caisse_pointage_apprem

| Info | Valeur |
|------|--------|
| Lignes | 7 |
| Colonnes | 30 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `utilisateur` | nvarchar | 8 | non |  | 6 |
| 2 | `chrono_session` | float | 53 | non |  | 7 |
| 3 | `chrono_detail` | int | 10 | non |  | 3 |
| 4 | `type` | nvarchar | 1 | non |  | 2 |
| 5 | `quand` | nvarchar | 1 | non |  | 3 |
| 6 | `date` | char | 8 | non |  | 6 |
| 7 | `heure` | char | 6 | non |  | 7 |
| 8 | `montant` | float | 53 | non |  | 7 |
| 9 | `montant_monnaie` | float | 53 | non |  | 7 |
| 10 | `montant_produits` | float | 53 | non |  | 1 |
| 11 | `montant_cartes` | float | 53 | non |  | 2 |
| 12 | `montant_cheques` | float | 53 | non |  | 1 |
| 13 | `montant_od` | float | 53 | non |  | 2 |
| 14 | `commentaire_ecart` | nvarchar | 30 | non |  | 2 |
| 15 | `nbre_devises` | int | 10 | non |  | 1 |
| 16 | `commentaire_ecart_devise` | nvarchar | 30 | non |  | 1 |
| 17 | `montant_libre_1` | float | 53 | non |  | 1 |
| 18 | `montant_libre_2` | float | 53 | non |  | 1 |
| 19 | `montant_libre_3` | float | 53 | non |  | 1 |
| 20 | `type_caisse_rec_ims` | nvarchar | 3 | non |  | 1 |
| 21 | `terminal_caisse` | nvarchar | 3 | non |  | 3 |
| 22 | `pointage` | nvarchar | 1 | non |  | 2 |
| 23 | `date_comptable` | char | 8 | non |  | 7 |
| 24 | `session_pointage` | float | 53 | non |  | 7 |
| 25 | `session_pointage_date` | char | 8 | non |  | 7 |
| 26 | `session_pointage_heure` | char | 6 | non |  | 7 |
| 27 | `session_pointage_qui` | nvarchar | 8 | non |  | 2 |
| 28 | `visu_detail` | nvarchar | 1 | non |  | 2 |
| 29 | `buffer_extensions` | nvarchar | 16 | non |  | 1 |
| 30 | `hostname_caisse` | nvarchar | 50 | non |  | 1 |

## Valeurs distinctes

### `utilisateur` (6 valeurs)

```
ARKON, BEAM, GIFT, JOLIE, MIND, SOLDE
```

### `chrono_session` (7 valeurs)

```
0, 1293, 234, 45, 47, 799, 885
```

### `chrono_detail` (3 valeurs)

```
0, 5, 7
```

### `type` (2 valeurs)

```
I, V
```

### `quand` (3 valeurs)

```
F, O, P
```

### `date` (6 valeurs)

```
20251010, 20251025, 20251219, 20251222, 20251223, 20251224
```

### `heure` (7 valeurs)

```
130642, 140935, 145116, 160420, 161457, 161940, 192212
```

### `montant` (7 valeurs)

```
0, 10000, 15000, 15524, 19000, 24000, 43230
```

### `montant_monnaie` (7 valeurs)

```
10000, 145767, 15000, 15524, 19000, 23000, 24000
```

### `montant_produits` (1 valeurs)

```
0
```

### `montant_cartes` (2 valeurs)

```
0, 20230
```

### `montant_cheques` (1 valeurs)

```
0
```

### `montant_od` (2 valeurs)

```
0, 1190
```

### `commentaire_ecart` (2 valeurs)

```
, Solde COFFRE 2
```

### `nbre_devises` (1 valeurs)

```
0
```

### `montant_libre_1` (1 valeurs)

```
0
```

### `montant_libre_2` (1 valeurs)

```
0
```

### `montant_libre_3` (1 valeurs)

```
0
```

### `terminal_caisse` (3 valeurs)

```
090, 430, 431
```

### `pointage` (2 valeurs)

```
, X
```

### `date_comptable` (7 valeurs)

```
00000000, 20251010, 20251025, 20251219, 20251222, 20251223, 20251224
```

### `session_pointage` (7 valeurs)

```
1e+012, 879, 892, 934, 935, 936, 937
```

### `session_pointage_date` (7 valeurs)

```
00000000, 20251010, 20251025, 20251219, 20251222, 20251223, 20251224
```

### `session_pointage_heure` (7 valeurs)

```
000000, 195253, 201905, 202716, 210834, 220404, 222922
```

### `session_pointage_qui` (2 valeurs)

```
, WELCMGR
```

### `visu_detail` (2 valeurs)

```
, ?
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_pointage_apprem_IDX_2 | NONCLUSTERED | non | date_comptable, terminal_caisse, date, heure |
| caisse_pointage_apprem_IDX_1 | NONCLUSTERED | oui | utilisateur, chrono_session, chrono_detail |

