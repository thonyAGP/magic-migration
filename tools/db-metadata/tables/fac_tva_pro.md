# fac_tva_pro

**Nom logique Magic** : `fac_tva_pro`

| Info | Valeur |
|------|--------|
| Lignes | 17565 |
| Colonnes | 32 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `service` | nvarchar | 20 | non |  | 23 |
| 3 | `compte_gm` | int | 10 | non |  | 4209 |
| 4 | `filiation` | smallint | 5 | non |  | 23 |
| 5 | `date` | char | 8 | non |  | 1268 |
| 6 | `row_id_vente` | int | 10 | non |  | 17565 |
| 7 | `Article` | int | 10 | non |  | 7685 |
| 8 | `flag` | bit |  | non |  | 2 |
| 9 | `utilisateur` | char | 10 | non |  | 99 |
| 10 | `num_facture` | float | 53 | non |  | 337 |
| 11 | `date_edition` | char | 8 | non |  | 189 |
| 12 | `nom_fichier_facture` | char | 100 | non |  | 337 |
| 13 | `avec_nom` | bit |  | non |  | 2 |
| 14 | `avec_adresse` | bit |  | non |  | 2 |
| 15 | `pu_ttc` | float | 53 | non |  | 1839 |
| 16 | `montant_remise` | float | 53 | non |  | 189 |
| 17 | `pu_net` | float | 53 | non |  | 1871 |
| 18 | `pu_ht` | float | 53 | non |  | 2558 |
| 19 | `tva` | float | 53 | non |  | 2 |
| 20 | `total_ht` | float | 53 | non |  | 2985 |
| 21 | `total_ttc` | float | 53 | non |  | 2116 |
| 22 | `qte` | smallint | 5 | non |  | 36 |
| 23 | `designation` | char | 150 | non |  | 2285 |
| 24 | `date_vente` | char | 8 | non |  | 1734 |
| 25 | `date_debut_sejour` | char | 8 | non |  | 1291 |
| 26 | `date_fin_sejour` | char | 8 | non |  | 1280 |
| 27 | `row_id_bout` | int | 10 | non |  | 1 |
| 28 | `code_application` | char | 1 | non |  | 5 |
| 29 | `pourcent_remise` | float | 53 | oui |  | 1 |
| 30 | `time_edition` | char | 6 | non |  | 1 |
| 31 | `Flag_selection_manuelle` | bit |  | non |  | 1 |
| 32 | `code_type` | nvarchar | 1 | oui |  | 3 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `service` (23 valeurs)

```
, ARZA, AUT1, BABY, BARD, BOUT, CAIS, CMAF, ESTH, EXCU, GEST, INFI, MINI, PHOT, PLAN, POO, PRES, REST, RET, SPNA, SPTE, STAN, TRAF
```

### `filiation` (23 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 18, 2, 20, 24, 28, 3, 30, 33, 4, 5, 6, 7, 8, 9
```

### `flag` (2 valeurs)

```
0, 1
```

### `avec_nom` (2 valeurs)

```
0, 1
```

### `avec_adresse` (2 valeurs)

```
0, 1
```

### `tva` (2 valeurs)

```
0, 7
```

### `qte` (36 valeurs)

```
0, 1, -1, 10, 11, 12, -12, 13, 14, 15, 16, 17, 18, 19, 2, -2, 20, 22, 24, 25, 27, 3, -3, 30, 33, 34, 4, -4, 44, 5, -5, 6, 7, 8, 9, -9
```

### `row_id_bout` (1 valeurs)

```
0
```

### `code_application` (5 valeurs)

```
 , A, P, R, W
```

### `pourcent_remise` (1 valeurs)

```
0
```

### `time_edition` (1 valeurs)

```
000000
```

### `Flag_selection_manuelle` (1 valeurs)

```
0
```

### `code_type` (3 valeurs)

```
, C, O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| fac_num_facture_IDX3 | NONCLUSTERED | non | num_facture |
| fac_tva_pro_IDX_2 | NONCLUSTERED | non | societe, service, compte_gm, filiation |
| fac_tva_pro_IDX_1 | NONCLUSTERED | oui | row_id_vente, row_id_bout, code_type |

