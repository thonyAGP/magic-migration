# effectif_quotidien

**Nom logique Magic** : `effectif_quotidien`

| Info | Valeur |
|------|--------|
| Lignes | 28973 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `efq_date_conso` | char | 8 | non |  | 1565 |
| 2 | `efq_qualite` | nvarchar | 3 | non |  | 4 |
| 3 | `efq_qua_compl` | nvarchar | 4 | non |  | 25 |
| 4 | `efq_nb_real_midi` | int | 10 | non |  | 696 |
| 5 | `efq_nb_real_soir` | int | 10 | non |  | 655 |
| 6 | `efq_nb_prev_midi` | int | 10 | non |  | 625 |
| 7 | `efq_nb_prev_soir` | int | 10 | non |  | 628 |
| 8 | `efq_nb_ajust_midi` | int | 10 | non |  | 53 |
| 9 | `efq_nb_ajust_soir` | int | 10 | non |  | 53 |
| 10 | `efq_lieu_sejour` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `efq_qualite` (4 valeurs)

```
GM, GO, IGR, VRL
```

### `efq_qua_compl` (25 valeurs)

```
, ANS, ARTI, AVDJ, CLUB, CMB, DOCT, ECH, EDUC, EXC, FOU, GE, HCMB, IGP, IGP2, MISS, ORDI, PRES, PROP, SEM, SRB, STAG, VILL, VSL, VSP
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| effectif_quotidien_IDX_1 | NONCLUSTERED | oui | efq_date_conso, efq_qualite, efq_qua_compl, efq_lieu_sejour |

