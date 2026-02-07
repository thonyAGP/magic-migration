# groupe_dat

| Info | Valeur |
|------|--------|
| Lignes | 33 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `grp_nom` | nvarchar | 20 | non |  | 33 |
| 2 | `grp_chemin_respons_` | nvarchar | 4 | non |  | 28 |
| 3 | `grp_chemin_simple` | nvarchar | 3 | non |  | 32 |
| 4 | `grp_champ_1` | nvarchar | 1 | non |  | 2 |
| 5 | `grp_champ_2` | nvarchar | 1 | non |  | 1 |
| 6 | `grp_champ_3` | nvarchar | 1 | non |  | 1 |
| 7 | `grp_champ_4` | nvarchar | 1 | non |  | 1 |
| 8 | `grp_champ_5` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `grp_nom` (33 valeurs)

```
BAR, BOUTIQUE, CAISSE, CDV - R Pole, CLUB MED BUSINESS, COMMERCE EXT. 1, COMMERCE EXT. 2, COMMERCE EXT. 3, COMMERCE EXTERIEUR, ECONOMAT, ENFANTS, EQUITATION, EXCURSIONS, GESTION, GOLF, INFIRMERIE, INFORMATICIEN, LINGERIE, MAINTENANCE, MAITRESSE DE MAISON, PHOTO, PLANNING, PLONGEE BTL, PREST. HOTELIERE, RECEPTION, RESSOURCES HUMAINES, RESTO, SKI, SPA, SPORTS, STANDARD TELEPHONE, TENNIS, TRAFIC
```

### `grp_chemin_respons_` (28 valeurs)

```
AUT1, AUT2, AUT3, BABY, BARD, BOUT, CAIS, CMAF, COMM, EQUI, ESTH, EXCU, GEST, GOLF, GPER, INFI, MAIN, MAMA, PHOT, PLAN, PRES, REST, SKIN, SPNA, SPTE, STAN, TENN, TRAF
```

### `grp_chemin_simple` (32 valeurs)

```
BAR, BOU, CAI, CE1, CE2, CE3, CEX, CGE, CHE, COU, ECO, EQU, EXC, GES, GOL, HOT, INF, MAI, MAT, PER, PHO, PLA, PRE, PRO, REC, RES, SKI, SPA, SPN, STD, TEN, TRA
```

### `grp_champ_1` (2 valeurs)

```
, A
```

### `grp_champ_3` (1 valeurs)

```
C
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| groupe_dat_IDX_1 | NONCLUSTERED | oui | grp_nom |

