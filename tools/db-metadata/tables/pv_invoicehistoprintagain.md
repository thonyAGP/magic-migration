# pv_invoicehistoprintagain

| Info | Valeur |
|------|--------|
| Lignes | 9404 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `hpa_chronoagain` | float | 53 | non |  | 9404 |
| 2 | `hpa_date` | char | 8 | non |  | 1143 |
| 3 | `hpa_time` | char | 6 | non |  | 8216 |
| 4 | `hpa_user` | nvarchar | 10 | non |  | 24 |
| 5 | `hpph_chrono` | int | 10 | non |  | 7791 |
| 6 | `pv_service` | nvarchar | 4 | non |  | 10 |

## Valeurs distinctes

### `hpa_user` (24 valeurs)

```
ASSTFAM, BAR1, BARMGR, BOUTIQUE, BTQ, CHUDA, DSIOP, EXC, EXC1, EXCMGR, FAM, FAMILLE, NURSE, PHOTO, PRAKBAR, RERE, REST, RESTMGR, SCUBA, SPA, SPA1, SPA2, SPA3, SPAMGR
```

### `pv_service` (10 valeurs)

```
BABY, BARD, BOUT, COMM, ESTH, EXCU, INFI, PHOT, REST, SPNA
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_invoicehistoprintagain_IDX_1 | NONCLUSTERED | oui | hpa_chronoagain |

