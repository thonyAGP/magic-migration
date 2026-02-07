# log_batch

**Nom logique Magic** : `log_batch`

| Info | Valeur |
|------|--------|
| Lignes | 60148 |
| Colonnes | 24 |
| Clef primaire | log_batch_id |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `log_batch_id` | bigint | 19 | non | PK | 60148 |
| 2 | `log_id_parent` | bigint | 19 | oui |  | 894 |
| 3 | `log_type` | nvarchar | 40 | non |  | 18 |
| 4 | `log_libelle_fixe` | nvarchar | 40 | non |  | 79 |
| 5 | `log_libelle_variable` | nvarchar | 100 | non |  | 16413 |
| 6 | `log_index` | nvarchar | 50 | non |  | 9597 |
| 7 | `log_debut` | datetime |  | oui |  | 55069 |
| 8 | `log_fin` | datetime |  | oui |  | 54791 |
| 9 | `log_duree_secondes` | bigint | 19 | non |  | 105 |
| 10 | `log_detail` | nvarchar | 4000 | non |  | 6808 |
| 11 | `log_taille` | int | 10 | non |  | 5 |
| 12 | `log_unite` | nvarchar | 40 | non |  | 5 |
| 13 | `log_statut` | nvarchar | 3 | non |  | 5 |
| 14 | `log_statut_detail` | nvarchar | 500 | non |  | 52 |
| 15 | `log_login` | nvarchar | 8 | non |  | 49 |
| 16 | `log_sysuser` | nvarchar | 50 | non |  | 34 |
| 17 | `log_hostname` | nvarchar | 50 | non |  | 33 |
| 18 | `log_blob_in` | varbinary | MAX | oui |  | 3126 |
| 19 | `log_blob_in_type` | nvarchar | 8 | non |  | 6 |
| 20 | `log_blob_out` | varbinary | MAX | oui |  | 11758 |
| 21 | `log_blob_out_type` | nvarchar | 8 | non |  | 4 |
| 22 | `log_blob_traitement` | varbinary | MAX | oui |  | 7679 |
| 23 | `log_blob_traitement_type` | nvarchar | 8 | non |  | 4 |
| 24 | `log_path` | nvarchar | 1000 | oui |  | 16178 |

## Valeurs distinctes

### `log_type` (18 valeurs)

```
, Automatic Update, ClubMedAPI, CREATCLI, Delete, DOC, EMAIL, ERROR, GM Delete, Logs Odyssey, OFFICEWEB, PAIEMENT API, PARAM, PMS_FROM_OPENBRAVO, PMS_TO_OPENBRAVO, PRINT, ROOM READY 2.0, SENDMAIL
```

### `log_taille` (5 valeurs)

```
0, 1, 2, 3, 4
```

### `log_unite` (5 valeurs)

```
, Appels, Cashup, lines, MAIL TYPES
```

### `log_statut` (5 valeurs)

```
, DEB, ERR, NFO, OK
```

### `log_login` (49 valeurs)

```
, ARKON, ASSTFAM, ASSTHK, AUN, BARMGR, BEAM, BTQMGR, DILYA, DOREEN, DORI, DSIOP, ESTELLE, EXC, EXCMGR, FAM, FAMILLE, FLORIAN, GIFT, HOUSEK, JAA, JENN, JOLIE, JULIA, KIMMY, MANAKA, MILY, MIND, MINN, NANA, NUENG, NURSE, OAT, ODYSSEY, PLANNING, PMS, PRAKBAR, PRAKRES, RDM, REST, SCUBA, SPA1, SPA2, SPA3, SPAMGR, TOMOKA, TRAFFIC, WELCMGR, WINNIE
```

### `log_sysuser` (34 valeurs)

```
, AdminPMS, PHUCCBAR01, PHUCCMAF01, PHUCCREC01, PHUCEXCU01, PHUCEXCU02, PHUCFAMI01, PHUCFITN01, phucfitn05, PHUCFNDB01, PHUCHOSM01, PHUCHOUS01, phuchous02, phucinfr01, PHUCKITC01, PHUCKITC03, PHUCNAFI01, PHUCNAFI02, PHUCPLAN01, PHUCPURE01, PHUCPURE02, PHUCRSTO01, PHUCSALE01, PHUCSCDI01, PHUCTRAF01, phuctraf02, PHUCUREC01, PHUCUREC02, PHUCUREC03, PHUCUREC04, PHUCUSTO01, PHUCVS2001\AdminPMS, pms
```

### `log_hostname` (33 valeurs)

```
, CMAWS6346766866, CMAWS8967768049, CMAWSGM0J4QL6, CMAWSGM0J6A9H, CMAWSGM0J6A9M, CMAWSGM0J6A9R, CMAWSGM0J6A9T, CMAWSGM0J6A9V, CMAWSGM0J6A9W, CMAWSGM0J6A9X, CMAWSGM0J6A9Y, CMAWSGM0J6A9Z, CMAWSGM0J6AA0, CMAWSGM0J6AA2, CMAWSGM0J6AA6, CMAWSGM0J6AA9, CMAWSGM0J6AAA, CMAWSGM0J6AAB, CMAWSGM0J6AAC, CMAWSGM0J6AAE, CMAWSGM0J6AAF, CMAWSGM0J6AAJ, CMAWSGM0J6AAK, CMAWSGM0J6AAL, CMAWSGM0J6AAP, CMAWSGM0J6AAQ, CMAWSGM0J6AAW, CMAWSPW0AJS0F, CMAWSPW0AJS0K, CMAWSPW0AJS0M, PHUCTB0009, PHUCVS2001
```

### `log_blob_in_type` (6 valeurs)

```
, csv, CSV, json, JSON, txt
```

### `log_blob_out_type` (4 valeurs)

```
, json, JSON, xlsx
```

### `log_blob_traitement_type` (4 valeurs)

```
, JSON, txt, xml
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_batch_IDX_2 | NONCLUSTERED | non | log_id_parent |
| log_batch_IDX_4 | NONCLUSTERED | non | log_debut |
| log_batch_IDX_3 | NONCLUSTERED | non | log_type, log_libelle_fixe, log_index |

