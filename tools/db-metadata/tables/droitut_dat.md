# droitut_dat

| Info | Valeur |
|------|--------|
| Lignes | 665 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `dut_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `dut_username` | nvarchar | 10 | non |  | 93 |
| 3 | `dut_droits` | nvarchar | 10 | non |  | 37 |

## Valeurs distinctes

### `dut_societe` (1 valeurs)

```
C
```

### `dut_droits` (37 valeurs)

```
, CAISSEADH, CAISSECAB, CAISSEFS, CAISSEGADH, CAISSEGST, CAISSEMT, CAISSEPRG, CAISSEVIL, CLEACCES, EXCURADM, EXCURMAN, EXCURMNT, INPUTHD, MESSACCES, PAYMENT, PLANNINGB, PLANNINGP, PLANNINGS, PVADMIN, PVENTE, PVMANAGE, PVUSE, REQACCES, REQCENTER, REQUEST, RESTOACCES, RETAILB, SIGNATURGO, SUPERVISOR, TRAFFIC, UNDO CTRL, UNDO DISP, UNDO FOUP, VALID CTRL, VALID DISP, VALID FOUP
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| droitut_dat_IDX_1 | NONCLUSTERED | oui | dut_societe, dut_username, dut_droits |

