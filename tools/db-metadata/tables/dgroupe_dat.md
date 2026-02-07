# dgroupe_dat

| Info | Valeur |
|------|--------|
| Lignes | 191 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `drt_nom` | nvarchar | 20 | non |  | 27 |
| 2 | `drt_droit_applicatif` | nvarchar | 10 | non |  | 40 |
| 3 | `drt_responsable` | bit |  | non |  | 2 |

## Valeurs distinctes

### `drt_nom` (27 valeurs)

```
BAR, BOUTIQUE, CAISSE, CDV - R Pole, CLUB MED BUSINESS, COMMERCE EXTERIEUR, ECONOMAT, ENFANTS, EQUITATION, EXCURSIONS, GESTION, GOLF, INFIRMERIE, MAINTENANCE, MAITRESSE DE MAISON, PHOTO, PLANNING, PLONGEE BTL, RECEPTION, RESSOURCES HUMAINES, RESTO, SKI, SPA, SPORTS, STANDARD TELEPHONE, TENNIS, TRAFIC
```

### `drt_droit_applicatif` (40 valeurs)

```
, ACCESADMIN, ACCESARCHI, ACCESSTAT, CAISSEADH, CAISSECAB, CAISSEFS, CAISSEGADH, CAISSEGST, CAISSEMT, CAISSEPRG, CAISSEVIL, CLEACCES, EXCURADM, EXCURMAN, EXCURMNT, INPUTHD, MESSACCES, PAYMENT, PLANNINGB, PLANNINGP, PLANNINGS, PURACCESS, PVADMIN, PVENTE, PVMANAGE, PVUSE, REQACCES, REQCENTER, REQUEST, RESTOACCES, RESTOADMIN, RETAILB, TRAFFIC, UNDO CTRL, UNDO DISP, UNDO FOUP, VALID CTRL, VALID DISP, VALID FOUP
```

### `drt_responsable` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| dgroupe_dat_IDX_1 | NONCLUSTERED | oui | drt_nom, drt_droit_applicatif |

