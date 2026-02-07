# caisse_session_detail

| Info | Valeur |
|------|--------|
| Lignes | 289 |
| Colonnes | 24 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `utilisateur` | nvarchar | 8 | non |  | 12 |
| 2 | `chrono_session` | float | 53 | non |  | 37 |
| 3 | `chrono_detail` | int | 10 | non |  | 9 |
| 4 | `type` | nvarchar | 1 | non |  | 7 |
| 5 | `quand` | nvarchar | 1 | non |  | 3 |
| 6 | `date` | char | 8 | non |  | 17 |
| 7 | `heure` | char | 6 | non |  | 110 |
| 8 | `montant` | float | 53 | non |  | 80 |
| 9 | `montant_monnaie` | float | 53 | non |  | 42 |
| 10 | `montant_produits` | float | 53 | non |  | 2 |
| 11 | `montant_cartes` | float | 53 | non |  | 20 |
| 12 | `montant_cheques` | float | 53 | non |  | 2 |
| 13 | `montant_od` | float | 53 | non |  | 18 |
| 14 | `commentaire_ecart` | nvarchar | 30 | non |  | 3 |
| 15 | `nbre_devises` | int | 10 | non |  | 1 |
| 16 | `commentaire_ecart_devise` | nvarchar | 30 | non |  | 1 |
| 17 | `montant_libre_1` | float | 53 | non |  | 1 |
| 18 | `montant_libre_2` | float | 53 | non |  | 1 |
| 19 | `montant_libre_3` | float | 53 | non |  | 1 |
| 20 | `type_caisse_rec_ims` | nvarchar | 3 | non |  | 2 |
| 21 | `terminal_caisse` | nvarchar | 3 | non |  | 10 |
| 22 | `ouverture_auto` | nvarchar | 1 | non |  | 2 |
| 23 | `buffer_extensions` | nvarchar | 9 | non |  | 1 |
| 24 | `hostname_caisse` | nvarchar | 50 | non |  | 10 |

## Valeurs distinctes

### `utilisateur` (12 valeurs)

```
ARKON, ASSTFAM, BEAM, DOREEN, ESTELLE, FAM, GIFT, JOLIE, JULIA, MIND, PLANNING, WELCMGR
```

### `chrono_session` (37 valeurs)

```
1293, 1294, 1295, 16, 17, 175, 176, 177, 18, 2, 224, 225, 226, 233, 234, 235, 3, 32, 33, 34, 4, 45, 46, 47, 654, 7, 797, 798, 799, 8, 885, 886, 887, 9, 935, 936, 937
```

### `chrono_detail` (9 valeurs)

```
1, 2, 3, 4, 5, 6, 7, 8, 9
```

### `type` (7 valeurs)

```
C, D, F, I, K, L, V
```

### `quand` (3 valeurs)

```
F, O, P
```

### `date` (17 valeurs)

```
20250619, 20251010, 20251017, 20251025, 20251125, 20251126, 20251128, 20251130, 20251201, 20251208, 20251212, 20251219, 20251220, 20251221, 20251222, 20251223, 20251224
```

### `montant_monnaie` (42 valeurs)

```
0, 0.61, 1, 10000, 10105, 10767, 111767, 11389, 130767, 13251, 13533, 145767, 14833, 15000, 15524, 16080, 168767, 19000, 19467, 19548, 19974, 20260, 21198, 21202, 22367, 23000, 23194, 24000, 24007, 24783, 25113, 25524, 26137, 27040, 27040.6, 28151, 32354, 34009, 36251, 37677, 39177, -4
```

### `montant_produits` (2 valeurs)

```
0, 11030
```

### `montant_cartes` (20 valeurs)

```
0, 12300, 13860, 14584.2, 20230, 21062.6, 25041, 26800, 28320, 3100, 4035, 47220, 47891, 5087, 53615.6, 63660, 81390, 86962, 93826.3, 94920
```

### `montant_cheques` (2 valeurs)

```
0, 91159
```

### `montant_od` (18 valeurs)

```
0, 11345, 1190, 1800, 2100, 215, 22055, 2600, 2635, 2910, -32111.9, 335, 420, 4495, 500, 5740, -5963, 800
```

### `commentaire_ecart` (3 valeurs)

```
, Exchange transaction, Rendu monnaie
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

### `type_caisse_rec_ims` (2 valeurs)

```
, REC
```

### `terminal_caisse` (10 valeurs)

```
, 090, 300, 430, 431, 432, 433, 500, 520, 571
```

### `ouverture_auto` (2 valeurs)

```
, O
```

### `hostname_caisse` (10 valeurs)

```
, CMAWSGM0J4QL6, CMAWSGM0J6A9V, CMAWSGM0J6A9W, CMAWSGM0J6A9X, CMAWSGM0J6AA2, CMAWSGM0J6AAE, CMAWSGM0J6AAJ, CMAWSGM0J6AAK, CMAWSPW0AJS0F
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_session_detail_IDX_1 | NONCLUSTERED | oui | utilisateur, chrono_session, chrono_detail |

