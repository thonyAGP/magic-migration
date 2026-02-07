# cafil098_dat

| Info | Valeur |
|------|--------|
| Lignes | 18 |
| Colonnes | 19 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `qua_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `qua_code_selection` | nvarchar | 1 | non |  | 2 |
| 3 | `qua_code_tri` | nvarchar | 2 | non |  | 9 |
| 4 | `qua_code_qualite` | nvarchar | 3 | non |  | 2 |
| 5 | `qua_compl__qualite` | nvarchar | 4 | non |  | 18 |
| 6 | `qua_libelle` | nvarchar | 24 | non |  | 18 |
| 7 | `qua_valeur` | nvarchar | 1 | non |  | 2 |
| 8 | `qua_1` | nvarchar | 1 | non |  | 2 |
| 9 | `qua_acces` | nvarchar | 1 | non |  | 1 |
| 10 | `qua_2` | float | 53 | non |  | 1 |
| 11 | `qua_forfait_ski` | bit |  | non |  | 1 |
| 12 | `qua_priorite` | int | 10 | non |  | 7 |
| 13 | `qua_tab_remplissage` | bit |  | non |  | 2 |
| 14 | `qua_type_jh` | nvarchar | 3 | non |  | 3 |
| 15 | `qua_libelle_ang` | nvarchar | 24 | non |  | 18 |
| 16 | `qua_stat_nuitee` | bit |  | non |  | 2 |
| 17 | `qua_regroup_famille` | bit |  | non |  | 2 |
| 18 | `qua_liste_menage` | bit |  | non |  | 1 |
| 19 | `qua_loc_as_GM` | bit |  | non |  | 2 |

## Valeurs distinctes

### `qua_societe` (1 valeurs)

```
C
```

### `qua_code_selection` (2 valeurs)

```
C, P
```

### `qua_code_tri` (9 valeurs)

```
01, 02, 03, 04, 05, 06, 07, 08, 09
```

### `qua_code_qualite` (2 valeurs)

```
GM, GO
```

### `qua_compl__qualite` (18 valeurs)

```
ANS, ARTI, CLUB, DOCT, EDUC, GE, IGP, IGP2, LOC, MISS, ORDI, PRES, PROP, SEM, STAG, VILL, VSEC, VSL
```

### `qua_libelle` (18 valeurs)

```
Accompagnant Non SalariÃ©, Artiste, Club Med', Eductour, Gentil EmployÃ©, Go Local, Igp Bureaux Et SiÃ¨ge, Igp Chef De Village, MÃ©decin, Mission, Ordinateur, Prestataire, PropriÃ©taire De Villa, PropriÃ©taire Vente SÃ¨che, SÃ©minaire, Stagiaire, Vente SÃ©jour Local, Village
```

### `qua_valeur` (2 valeurs)

```
0, 1
```

### `qua_1` (2 valeurs)

```
, N
```

### `qua_acces` (1 valeurs)

```
N
```

### `qua_2` (1 valeurs)

```
0
```

### `qua_forfait_ski` (1 valeurs)

```
0
```

### `qua_priorite` (7 valeurs)

```
0, 1, 2, 3, 4, 5, 6
```

### `qua_tab_remplissage` (2 valeurs)

```
0, 1
```

### `qua_type_jh` (3 valeurs)

```
, JHD, JHP
```

### `qua_libelle_ang` (18 valeurs)

```
, Accompagnee non-employee, Artist, Club Med', Computeur, Contractor, Doctor, Farmtrip, GE, Invited chief of village, Invited office and siege, Local GO, Mission, Seminary, Trainee, Villa owner, Village, VSL
```

### `qua_stat_nuitee` (2 valeurs)

```
0, 1
```

### `qua_regroup_famille` (2 valeurs)

```
0, 1
```

### `qua_liste_menage` (1 valeurs)

```
1
```

### `qua_loc_as_GM` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil098_dat_IDX_1 | NONCLUSTERED | oui | qua_societe, qua_code_selection, qua_code_tri, qua_code_qualite, qua_compl__qualite, qua_valeur |
| cafil098_dat_IDX_2 | NONCLUSTERED | oui | qua_societe, qua_code_qualite, qua_compl__qualite |

