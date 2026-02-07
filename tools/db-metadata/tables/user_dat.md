# user_dat

| Info | Valeur |
|------|--------|
| Lignes | 95 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `uti_groupe` | nvarchar | 20 | non |  | 22 |
| 2 | `uti_societe` | nvarchar | 1 | non |  | 1 |
| 3 | `uti_user` | nvarchar | 8 | non |  | 95 |
| 4 | `uti_password` | nvarchar | 64 | oui |  | 76 |
| 5 | `uti_description` | nvarchar | 20 | non |  | 89 |
| 6 | `uti_info` | nvarchar | 17 | non |  | 43 |
| 7 | `uti_langue` | nvarchar | 3 | non |  | 2 |
| 8 | `uti_flag_responsable` | nvarchar | 1 | non |  | 2 |
| 9 | `uti_matricule` | nvarchar | 30 | non |  | 5 |

## Valeurs distinctes

### `uti_groupe` (22 valeurs)

```
BAR, BOUTIQUE, CAISSE, CLUB MED BUSINESS, COMMERCE EXTERIEUR, ENFANTS, EXCURSIONS, GESTION, INFIRMERIE, INFORMATICIEN, MAINTENANCE, MAITRESSE DE MAISON, PHOTO, PLANNING, PLONGEE BTL, PREST. HOTELIERE, RECEPTION, RESSOURCES HUMAINES, RESTO, SKI, SPA, TRAFIC
```

### `uti_societe` (1 valeurs)

```
C
```

### `uti_info` (43 valeurs)

```
, 1, Assistant Fiance, Asst HK, Bar, Bar manager, BTQ SHOP, CO PR, Excursion, Excursion manager, FnB MGR, front desk, GE, Housekeeping, Informatique, jilly, LEM, MC, MGR, mini club, Mini CLub, MINI CLUB, night, NIHOUARN, Nurse, Photo, RDM, Resp Famille, Restaurant, RU PR W&S, Sales MGR, Scuba Diving, sophia, Spa, Spa Expert, SPA Manager, STM, Traffic, Trainee, W&S, W&S Coordinator, W&S GE, Welcome MGR
```

### `uti_langue` (2 valeurs)

```
ANG, FRA
```

### `uti_flag_responsable` (2 valeurs)

```
N, O
```

### `uti_matricule` (5 valeurs)

```
, 407569, 422634, 453170, MGR
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| user_dat_IDX_1 | NONCLUSTERED | oui | uti_groupe, uti_societe, uti_user |
| user_dat_IDX_2 | NONCLUSTERED | oui | uti_societe, uti_user |

