# effectif_Q_new

| Info | Valeur |
|------|--------|
| Lignes | 6622617 |
| Colonnes | 20 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `eff_date_consommation` | char | 8 | non |  | 742294 |
| 2 | `eff_qualite` | nvarchar | 3 | non |  | 5 |
| 3 | `eff_qualite_complementaire` | nvarchar | 4 | non |  | 21 |
| 4 | `eff_code_repas_nenc_vil` | nvarchar | 6 | non |  | 16 |
| 5 | `rti_num_ligne_sod` | int | 10 | non |  | 1 |
| 6 | `eff_groupe` | nvarchar | 50 | non |  | 204 |
| 7 | `eff_societe` | nvarchar | 1 | non |  | 2 |
| 8 | `eff_compte` | int | 10 | non |  | 172643 |
| 9 | `eff_filiation` | int | 10 | non |  | 49 |
| 10 | `eff_repas` | nvarchar | 6 | non |  | 2 |
| 11 | `eff_motif_annulation` | nvarchar | 100 | non |  | 89 |
| 12 | `eff_nb_reel` | int | 10 | non |  | 171 |
| 13 | `eff_nb_prev` | int | 10 | non |  | 171 |
| 14 | `eff_statut_validation` | nvarchar | 1 | non |  | 3 |
| 15 | `eff_date_validation` | char | 8 | non |  | 2034 |
| 16 | `eff_nb_ajustement` | int | 10 | non |  | 176 |
| 17 | `eff_date_der_modif` | char | 8 | non |  | 2170 |
| 18 | `eff_heure_der_modif` | char | 6 | non |  | 42533 |
| 19 | `eff_user_der_modif` | nvarchar | 8 | non |  | 123 |
| 20 | `eff_lieu_sejour` | nvarchar | 1 | non |  | 3 |

## Valeurs distinctes

### `eff_qualite` (5 valeurs)

```
, GM, GO, IGR, VRL
```

### `eff_qualite_complementaire` (21 valeurs)

```
, ANS, ARTI, CLUB, CMB, DOCT, ECH, EDUC, EXC, FOU, GE, IGP, IGP2, MISS, ORDI, PRES, PROP, SEM, STAG, VILL, VSL
```

### `eff_code_repas_nenc_vil` (16 valeurs)

```
, ESFVIL, EXCALA, EXCVDE, GEALA, GEGEMP, GMPRES, GOVILL, IGR, IGRBSI, IGRFOU, IGRVDE, REGANS, SEMALA, VRL, VRLHP
```

### `rti_num_ligne_sod` (1 valeurs)

```
0
```

### `eff_societe` (2 valeurs)

```
, C
```

### `eff_filiation` (49 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 3, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 4, 40, 41, 42, 43, 44, 45, 46, 47, 48, 5, 6, 7, 8, 9
```

### `eff_repas` (2 valeurs)

```
DEJ, DIN
```

### `eff_statut_validation` (3 valeurs)

```
, D, V
```

### `eff_lieu_sejour` (3 valeurs)

```
, *, G
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| effectif_Q_new_IDX_1 | NONCLUSTERED | oui | eff_date_consommation, eff_code_repas_nenc_vil, eff_groupe, eff_societe, eff_compte, eff_filiation, eff_repas, eff_lieu_sejour |

