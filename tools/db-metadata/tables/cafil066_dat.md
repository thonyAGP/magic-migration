# cafil066_dat

| Info | Valeur |
|------|--------|
| Lignes | 45312 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `station` | nvarchar | 10 | non |  | 43 |
| 3 | `codage` | nvarchar | 4 | non |  | 41 |
| 4 | `date` | char | 8 | non |  | 71 |
| 5 | `heure` | char | 6 | non |  | 22143 |
| 6 | `libelle` | nvarchar | 40 | non |  | 18400 |
| 7 | `RowId_88` | int | 10 | non |  | 45312 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `station` (43 valeurs)

```
ARKON, Arkon BUNC, Assistant, ASSTHK, AUN, BARMGR, Beam, BEAM, DOREEN, DORI, ESTELLE, EXC, EXCMGR, FAM, FAMILLE, FLORIAN, GIFT, HOUSEK, Jaa, JAA, JENN, JOLIE, JULIA, KIMMY, M&E MGR, MANAKA, mild, MILY, MIND, NANA, NUENG, NURSE, OAT, PLANNING, PRAKBAR, RDM     , REST, SPAMGR, TOMOKA, TRAFFIC, WELCMGR, Welcome MG, WINNIE
```

### `codage` (41 valeurs)

```
AFFC, AGAR, ANUT, AVAP, AVAZ, BLOC, CGAR, CRCL, CRPE, CRUT, DEBC, DEVL, EMES, FMES, INTP, INTZ, LIBC, LMES, MCFG, MNOC, MOUT, MRPE, PROP, PROZ, REAP, REAZ, REIM, REPP, REPZ, RESA, RETP, RETZ, STCN, STCO, SUGM, SUGO, SUPP, SUPZ, TACL, TBCL, VALI
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil066_dat_IDX_3 | NONCLUSTERED | non | societe, date |
| cafil066_dat_IDX_1 | NONCLUSTERED | non | societe, station, date, heure |
| cafil066_dat_IDX_4 | NONCLUSTERED | oui | RowId_88 |
| cafil066_dat_IDX_2 | NONCLUSTERED | non | societe, codage, date, heure |

