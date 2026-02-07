# droit_apps_dat

| Info | Valeur |
|------|--------|
| Lignes | 21 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `apps` | nvarchar | 10 | non |  | 2 |
| 2 | `module` | nvarchar | 10 | non |  | 5 |
| 3 | `droit` | nvarchar | 10 | non |  | 21 |
| 4 | `libelle` | nvarchar | 30 | non |  | 21 |

## Valeurs distinctes

### `apps` (2 valeurs)

```
PVENTE, REQUEST
```

### `module` (5 valeurs)

```
CLE, MESSAGE, REQ, RESTO, SKI
```

### `droit` (21 valeurs)

```
ACCESADMIN, ACCESARCHI, ACCESSTAT, CLEACCES, INPUTHD, MESSACCES, PAYMENT, PURACCESS, PVADMIN, PVMANAGE, PVUSE, REQACCES, REQCENTER, RESTOACCES, RESTOADMIN, UNDO CTRL, UNDO DISP, UNDO FOUP, VALID CTRL, VALID DISP, VALID FOUP
```

### `libelle` (21 valeurs)

```
AccÃ¨s Responsable PVente, AccÃ¨s Saisie HD, AccÃ¨s Saisie Types de Paiement, AccÃ¨s Utilisateur PVente, Access to GMGO requests, Administration PVente, Request Administration Access, Request Archive Access, Request Center, Request Key Code Access, Request Messages Access, Request Purge Access, Request Restaurant Access, Request Restaurant Adm, Request Stats Access, Request Undo Control, Request Undo Dispatch, Request Undo Follow Up, Request Valid Control, Request Valid Dispatch, Request Valid Follow Up
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| droit_apps_dat_IDX_1 | NONCLUSTERED | oui | apps, module, droit |

