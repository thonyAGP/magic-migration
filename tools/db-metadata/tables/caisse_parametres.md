# caisse_parametres

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 34 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cle` | nvarchar | 6 | non |  | 1 |
| 2 | `mop_cmp` | nvarchar | 4 | non |  | 1 |
| 3 | `class_od` | nvarchar | 6 | non |  | 1 |
| 4 | `compte_ecart_gain` | int | 10 | non |  | 1 |
| 5 | `compte_ecart_perte` | int | 10 | non |  | 1 |
| 6 | `supprime_comptes_fin_centralise` | bit |  | non |  | 1 |
| 7 | `supprime_mop_centralise` | bit |  | non |  | 1 |
| 8 | `article_compte_derniere_minute` | int | 10 | non |  | 1 |
| 9 | `compte_appro_caisse` | int | 10 | non |  | 1 |
| 10 | `compte_remise_caisse` | int | 10 | non |  | 1 |
| 11 | `compte_fdr_receptionniste` | int | 10 | non |  | 1 |
| 12 | `compte_bilan_mini_1` | int | 10 | non |  | 1 |
| 13 | `compte_bilan_maxi_1` | int | 10 | non |  | 1 |
| 14 | `sessions_caisse_a_conserver` | int | 10 | non |  | 1 |
| 15 | `comptages_coffre_a_conserver` | int | 10 | non |  | 1 |
| 16 | `num_terminal_caisse_mini` | int | 10 | non |  | 1 |
| 17 | `num_terminal_caisse_maxi` | int | 10 | non |  | 1 |
| 18 | `compte_versretrait_non_cash` | int | 10 | non |  | 1 |
| 19 | `compte_versretrait_cash` | int | 10 | non |  | 1 |
| 20 | `separateur_decimal_excel` | nvarchar | 1 | non |  | 1 |
| 21 | `initialisation_automatique` | bit |  | non |  | 1 |
| 22 | `position_ims_dans_magicini` | int | 10 | non |  | 1 |
| 23 | `gestion_caisse_avec_2_coffres` | nvarchar | 1 | non |  | 1 |
| 24 | `position_xtrack_dans_magicini` | int | 10 | non |  | 1 |
| 25 | `service_1_sans_session_ims` | nvarchar | 4 | non |  | 1 |
| 26 | `service_2_sans_session_ims` | nvarchar | 4 | non |  | 1 |
| 27 | `service_3_sans_session_ims` | nvarchar | 4 | non |  | 1 |
| 28 | `service_4_sans_session_ims` | nvarchar | 4 | non |  | 1 |
| 29 | `service_5_sans_session_ims` | nvarchar | 4 | non |  | 1 |
| 30 | `compte_boutique` | int | 10 | non |  | 1 |
| 31 | `cloture_automatique` | nvarchar | 1 | non |  | 1 |
| 32 | `activite_boutique` | int | 10 | non |  | 1 |
| 33 | `code_a_barres_ims` | bit |  | non |  | 1 |
| 34 | `buffer` | nvarchar | 99 | non |  | 1 |

## Valeurs distinctes

### `cle` (1 valeurs)

```
CAISSE
```

### `mop_cmp` (1 valeurs)

```
OD
```

### `class_od` (1 valeurs)

```
OD
```

### `compte_ecart_gain` (1 valeurs)

```
758800385
```

### `compte_ecart_perte` (1 valeurs)

```
658800385
```

### `supprime_comptes_fin_centralise` (1 valeurs)

```
0
```

### `supprime_mop_centralise` (1 valeurs)

```
0
```

### `article_compte_derniere_minute` (1 valeurs)

```
999999
```

### `compte_appro_caisse` (1 valeurs)

```
580100000
```

### `compte_remise_caisse` (1 valeurs)

```
580100000
```

### `compte_fdr_receptionniste` (1 valeurs)

```
541150000
```

### `compte_bilan_mini_1` (1 valeurs)

```
467000
```

### `compte_bilan_maxi_1` (1 valeurs)

```
467999
```

### `sessions_caisse_a_conserver` (1 valeurs)

```
3
```

### `comptages_coffre_a_conserver` (1 valeurs)

```
5
```

### `num_terminal_caisse_mini` (1 valeurs)

```
0
```

### `num_terminal_caisse_maxi` (1 valeurs)

```
999
```

### `compte_versretrait_non_cash` (1 valeurs)

```
532188000
```

### `compte_versretrait_cash` (1 valeurs)

```
532188000
```

### `separateur_decimal_excel` (1 valeurs)

```
.
```

### `initialisation_automatique` (1 valeurs)

```
1
```

### `position_ims_dans_magicini` (1 valeurs)

```
9
```

### `gestion_caisse_avec_2_coffres` (1 valeurs)

```
O
```

### `position_xtrack_dans_magicini` (1 valeurs)

```
28
```

### `compte_boutique` (1 valeurs)

```
707610340
```

### `cloture_automatique` (1 valeurs)

```
O
```

### `activite_boutique` (1 valeurs)

```
340
```

### `code_a_barres_ims` (1 valeurs)

```
1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_parametres_IDX_1 | NONCLUSTERED | oui | cle |

