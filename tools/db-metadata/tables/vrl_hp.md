# vrl_hp

**Nom logique Magic** : `vrl_hp`

| Info | Valeur |
|------|--------|
| Lignes | 8184 |
| Colonnes | 13 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `vhp_date_conso` | char | 8 | non |  | 1488 |
| 2 | `vhp_code_repas_nenc_vil` | nvarchar | 6 | non |  | 13 |
| 3 | `vhp_groupe` | nvarchar | 50 | non |  | 2407 |
| 4 | `vhp_nb_real` | int | 10 | non |  | 158 |
| 5 | `vhp_nb_prev` | int | 10 | non |  | 159 |
| 6 | `vhp_repas` | nvarchar | 3 | non |  | 3 |
| 7 | `vhp_motif_annulation` | nvarchar | 100 | non |  | 45 |
| 8 | `vhp_date_der_modif` | char | 8 | non |  | 1387 |
| 9 | `vhp_heure_der_modif` | char | 6 | non |  | 5908 |
| 10 | `vhp_user_der_modif` | nvarchar | 8 | non |  | 35 |
| 11 | `vhp_lieu_sejour` | nvarchar | 1 | non |  | 1 |
| 12 | `vhp_date_operation` | char | 8 | non |  | 1388 |
| 13 | `vhp_nb_real_initial` | int | 10 | non |  | 159 |

## Valeurs distinctes

### `vhp_code_repas_nenc_vil` (13 valeurs)

```
ESFVIL, EXCALA, EXCVDE, GEALA, GEGEMP, GMPRES, GOVILL, IGRBSI, IGRFOU, IGRVDE, REGANS, SEMALA, VRLHP
```

### `vhp_repas` (3 valeurs)

```
DDE, DEJ, DIN
```

### `vhp_motif_annulation` (45 valeurs)

```
, +dinner, A  LA CARTE, ADD DINNER, CANCEL, cancel GM will pay on side for the daypass, cancel tour, Cancel tour, CANCELLED LUNCH, DESCRIPTION, Didn't go, dinner, dont have sarah in PMS, doubled, ERROR TYPE OF MEAL, ge's in the village, mistake, MISTAKE, not coming in weekends, only lunch, PHIPHI ON 01/OCT, recorded on 09th, test, TEST, VRL will be paid onsite (and will appear as normal daypass), wrong, WRONG, wrong calculation, wrong create, wrong date, WRONG DATE, wrong date 15/11, wrong input, WRONG INPUT, wrong meal, WRONG MEAL, wrong meal type, WRONG MEAL TYPE, wrong name, WRONG NAME, wrong title, WRONG TITLE, wrong trype of meal, wrong type of meal, wrong village
```

### `vhp_user_der_modif` (35 valeurs)

```
ALEKSEI, ANN, ARKON, ASSTREC, AUM, BEAM, DADA, DOREEN, DORI, ESTELLE, EXC, FAJAR, FAM, GENESIS, GIFT, JAA, JOLIE, JULIA, LYS, MICKY, MIND, MINT, NANA, NUENG, PLANNING, PRYME, REMI, RITA, SNOW, SPA3, SPAMGR, TEMMY, TOMOKA, WELCMGR, YOHAN
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| vrl_hp_IDX_1 | NONCLUSTERED | oui | vhp_date_conso, vhp_code_repas_nenc_vil, vhp_groupe, vhp_repas, vhp_motif_annulation, vhp_lieu_sejour |

