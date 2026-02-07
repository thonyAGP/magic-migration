# cafil092_dat

| Info | Valeur |
|------|--------|
| Lignes | 135 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `mnu_nom_menu` | nvarchar | 5 | non |  | 25 |
| 2 | `mnu_code_langue` | nvarchar | 1 | non |  | 2 |
| 3 | `mnu_code_alpha_deux` | nvarchar | 2 | non |  | 40 |
| 4 | `mnu_libelle_menu` | nvarchar | 21 | non |  | 99 |
| 5 | `mnu_hot_key` | nvarchar | 6 | non |  | 1 |
| 6 | `mnu_libelle_etendu` | nvarchar | 50 | non |  | 97 |
| 7 | `mnu_acces` | nvarchar | 1 | non |  | 2 |

## Valeurs distinctes

### `mnu_nom_menu` (25 valeurs)

```
MPBCL, MPBGE, MPBLO, MPBPE, MPBUT, MPFCL, MPFGE, MPFLO, MPFPE, MPFUT, MPNUT, MPPCL, MPPGE, MPPLO, MPPPE, MPPSP, MPPUT, MPSCL, MPSGE, MPSLO, MPSPE, MPSUT, TRPCL, TRPGE, TRPSP
```

### `mnu_code_langue` (2 valeurs)

```
F, G
```

### `mnu_code_alpha_deux` (40 valeurs)

```
00, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31, 32, 33, 34, 35, 40, 41, 42, 43, 44, 45, 90, 91, 92
```

### `mnu_acces` (2 valeurs)

```
N, O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil092_dat_IDX_1 | NONCLUSTERED | oui | mnu_nom_menu, mnu_acces, mnu_code_langue, mnu_code_alpha_deux |

