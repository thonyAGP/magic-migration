# type_repas_nenc_vill

**Nom logique Magic** : `type_repas_nenc_vill`

| Info | Valeur |
|------|--------|
| Lignes | 20 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `trnv_code` | nvarchar | 6 | non |  | 20 |
| 2 | `trnv_libelle` | nvarchar | 60 | non |  | 20 |
| 3 | `trnv_sens` | nvarchar | 1 | non |  | 2 |
| 4 | `trnv_coeff` | float | 53 | non |  | 1 |
| 5 | `trnv_type_jh` | nvarchar | 5 | non |  | 2 |
| 6 | `trnv_libelle_ANG` | nvarchar | 60 | non |  | 20 |

## Valeurs distinctes

### `trnv_code` (20 valeurs)

```
ESFVDE, ESFVIL, EXCALA, EXCVDE, GEALA, GEGEMP, GMPRES, GOLOC, GOVALA, GOVILL, GOVVDE, IGRALA, IGRBSI, IGRFOU, IGRSAV, IGRVDE, IGRVSP, REGANS, SEMALA, VRLHP
```

### `trnv_libelle` (20 valeurs)

```
Ecole de ski du village, Ecole de ski venant de, Excursion allant Ã , Excursion venant de, GE Gentil EmployÃ©, GE Village allant Ã , GM Prestataire, GM SEM allant Ã , GM/IGR Echange repas chalets et inter villages allant Ã , GM/IGR Echange repas chalets et inter villages venant de, GO Locaux, GO Village, GO Village allant Ã , GO Village venant de, IGR Bureaux et SiÃ¨ge, IGR CCS, IGR Fournisseurs, IGR Surbook Avion, RÃ©gularisation ANS, VRL EncaissÃ©es HP
```

### `trnv_sens` (2 valeurs)

```
-, +
```

### `trnv_coeff` (1 valeurs)

```
0.5
```

### `trnv_type_jh` (2 valeurs)

```
JHD, JHVRL
```

### `trnv_libelle_ANG` (20 valeurs)

```
Adjustment ANS, Excursion coming from, Excursion going to, GE Gentil Employe, GE Village going to, GM Provider, GM Sem going to, GM/IGR Exchange coming from, GM/IGR Exchange going to, GO Local, GO Village, GO Village coming from, GO Village going to, IGR CCS, IGR Office, IGR overbooking, IGR Providers, Ski school coming from, Ski school of the resort, VRL off site
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| type_repas_nenc_vill_IDX_1 | NONCLUSTERED | oui | trnv_code |

