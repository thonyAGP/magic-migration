# cafil094_dat

| Info | Valeur |
|------|--------|
| Lignes | 85 |
| Colonnes | 31 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `operateur` | nvarchar | 10 | non |  | 85 |
| 3 | `nom_complet` | nvarchar | 25 | non |  | 82 |
| 4 | `code_acces` | nvarchar | 1 | non |  | 1 |
| 5 | `date_creation` | char | 8 | non |  | 64 |
| 6 | `cree_par` | nvarchar | 10 | non |  | 10 |
| 7 | `derniere_date` | char | 8 | non |  | 45 |
| 8 | `derniere_heure` | char | 6 | non |  | 80 |
| 9 | `aut_creation` | nvarchar | 1 | non |  | 3 |
| 10 | `aut_modification` | nvarchar | 1 | non |  | 2 |
| 11 | `aut_affectation` | nvarchar | 1 | non |  | 2 |
| 12 | `aut_prolongation` | nvarchar | 1 | non |  | 2 |
| 13 | `aut_interruption` | nvarchar | 1 | non |  | 2 |
| 14 | `aut_avancement` | nvarchar | 1 | non |  | 2 |
| 15 | `aut_recodification` | nvarchar | 1 | non |  | 2 |
| 16 | `aut_annulation` | nvarchar | 1 | non |  | 2 |
| 17 | `aut_messagerie` | nvarchar | 1 | non |  | 2 |
| 18 | `aut_validation` | nvarchar | 1 | non |  | 2 |
| 19 | `aut_devalidation` | nvarchar | 1 | non |  | 2 |
| 20 | `aut_immigration` | nvarchar | 1 | non |  | 2 |
| 21 | `aut_liberation` | nvarchar | 1 | non |  | 2 |
| 22 | `aut_blocage` | nvarchar | 1 | non |  | 2 |
| 23 | `aut_statut` | nvarchar | 1 | non |  | 2 |
| 24 | `reserve1` | nvarchar | 1 | non |  | 2 |
| 25 | `reserve2` | nvarchar | 1 | non |  | 2 |
| 26 | `reserve3` | nvarchar | 1 | non |  | 2 |
| 27 | `acces_back_front_office` | nvarchar | 1 | non |  | 2 |
| 28 | `reserve4` | nvarchar | 1 | non |  | 1 |
| 29 | `reserve5` | nvarchar | 1 | non |  | 1 |
| 30 | `reserve6` | nvarchar | 1 | non |  | 1 |
| 31 | `aut_affect_auto` | nvarchar | 1 | non |  | 2 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `code_acces` (1 valeurs)

```
O
```

### `cree_par` (10 valeurs)

```
ANGELA, ASIAMIS, CHIHARU, DSIOP, ELIE, ELIEI, FAM, JPAUL, SUPERVISOR, WELCMGR
```

### `derniere_date` (45 valeurs)

```
19990427, 19990923, 20081010, 20090427, 20100503, 20120928, 20130708, 20141001, 20220307, 20220415, 20230919, 20231222, 20240912, 20241115, 20250509, 20250602, 20250606, 20250711, 20250714, 20250906, 20250917, 20251008, 20251013, 20251016, 20251018, 20251030, 20251106, 20251110, 20251113, 20251114, 20251116, 20251121, 20251201, 20251204, 20251207, 20251209, 20251211, 20251213, 20251215, 20251219, 20251220, 20251221, 20251222, 20251223, 20251224
```

### `aut_creation` (3 valeurs)

```
, N, O
```

### `aut_modification` (2 valeurs)

```
N, O
```

### `aut_affectation` (2 valeurs)

```
N, O
```

### `aut_prolongation` (2 valeurs)

```
N, O
```

### `aut_interruption` (2 valeurs)

```
N, O
```

### `aut_avancement` (2 valeurs)

```
N, O
```

### `aut_recodification` (2 valeurs)

```
N, O
```

### `aut_annulation` (2 valeurs)

```
N, O
```

### `aut_messagerie` (2 valeurs)

```
N, O
```

### `aut_validation` (2 valeurs)

```
N, O
```

### `aut_devalidation` (2 valeurs)

```
N, O
```

### `aut_immigration` (2 valeurs)

```
N, O
```

### `aut_liberation` (2 valeurs)

```
N, O
```

### `aut_blocage` (2 valeurs)

```
N, O
```

### `aut_statut` (2 valeurs)

```
N, O
```

### `reserve1` (2 valeurs)

```
N, O
```

### `reserve2` (2 valeurs)

```
N, O
```

### `reserve3` (2 valeurs)

```
N, O
```

### `acces_back_front_office` (2 valeurs)

```
B, F
```

### `aut_affect_auto` (2 valeurs)

```
N, O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil094_dat_IDX_1 | NONCLUSTERED | oui | societe, operateur |
| cafil094_dat_IDX_3 | NONCLUSTERED | non | societe, nom_complet, derniere_date |
| cafil094_dat_IDX_2 | NONCLUSTERED | non | societe, nom_complet |

