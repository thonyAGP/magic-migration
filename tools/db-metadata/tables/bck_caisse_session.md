# bck_caisse_session

| Info | Valeur |
|------|--------|
| Lignes | 96 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `utilisateur` | nvarchar | 8 | non |  | 12 |
| 2 | `chrono` | float | 53 | non |  | 44 |
| 3 | `date_debut_session` | char | 8 | non |  | 13 |
| 4 | `heure_debut_session` | char | 6 | non |  | 44 |
| 5 | `date_fin_session` | char | 8 | non |  | 13 |
| 6 | `heure_fin_session` | char | 6 | non |  | 44 |
| 7 | `date_comptable` | char | 8 | non |  | 8 |
| 8 | `pointage` | bit |  | non |  | 1 |
| 9 | `RowId_18` | int | 10 | non |  | 96 |

## Valeurs distinctes

### `utilisateur` (12 valeurs)

```
ARKON, ASSTFAM, BEAM, DOREEN, ESTELLE, FAM, GIFT, JOLIE, JULIA, MIND, PLANNING, WELCMGR
```

### `chrono` (44 valeurs)

```
1291, 1292, 1293, 1294, 1295, 176, 177, 18, 226, 228, 229, 230, 232, 233, 234, 235, 28, 29, 30, 31, 32, 33, 34, 4, 47, 793, 794, 795, 796, 797, 798, 799, 882, 883, 884, 885, 886, 887, 9, 933, 934, 935, 936, 937
```

### `date_debut_session` (13 valeurs)

```
20251025, 20251130, 20251201, 20251212, 20251216, 20251217, 20251218, 20251219, 20251220, 20251221, 20251222, 20251223, 20251224
```

### `heure_debut_session` (44 valeurs)

```
000214, 072107, 073822, 074008, 074204, 074242, 074516, 074547, 074932, 080004, 080440, 080742, 081414, 081910, 083056, 091249, 094252, 100112, 100646, 100849, 101717, 102113, 111638, 115332, 120225, 120410, 120457, 120807, 121429, 121742, 122309, 130501, 145018, 152550, 153233, 153500, 154509, 154905, 160110, 160435, 161457, 163730, 170445, 203739
```

### `date_fin_session` (13 valeurs)

```
20251025, 20251130, 20251201, 20251212, 20251216, 20251217, 20251218, 20251219, 20251220, 20251221, 20251222, 20251223, 20251224
```

### `heure_fin_session` (44 valeurs)

```
000436, 094348, 101730, 102135, 145117, 155320, 155723, 160600, 161101, 161318, 161602, 161941, 162257, 163202, 164051, 164431, 164439, 164601, 165505, 184039, 192312, 195342, 201924, 201931, 202654, 203124, 203942, 204011, 204348, 204353, 204725, 204942, 212112, 222528, 222939, 223851, 225852, 230119, 230314, 230321, 231144, 231514, 231850, 231933
```

### `date_comptable` (8 valeurs)

```
20251217, 20251218, 20251219, 20251220, 20251221, 20251222, 20251223, 20251224
```

### `pointage` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| bck_caisse_session_IDX_2 | NONCLUSTERED | non | date_comptable |
| bck_caisse_session_IDX_4 | NONCLUSTERED | oui | RowId_18 |
| bck_caisse_session_IDX_1 | NONCLUSTERED | non | utilisateur, chrono |
| bck_caisse_session_IDX_3 | NONCLUSTERED | non | pointage |

