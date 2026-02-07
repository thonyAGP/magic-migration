# tmp_caisse_session

| Info | Valeur |
|------|--------|
| Lignes | 12 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `utilisateur` | nvarchar | 8 | non |  | 12 |
| 2 | `chrono` | float | 53 | non |  | 12 |
| 3 | `date_debut_session` | char | 8 | non |  | 7 |
| 4 | `heure_debut_session` | char | 6 | non |  | 12 |
| 5 | `date_fin_session` | char | 8 | non |  | 7 |
| 6 | `heure_fin_session` | char | 6 | non |  | 12 |
| 7 | `date_comptable` | char | 8 | non |  | 1 |
| 8 | `pointage` | bit |  | non |  | 1 |

## Valeurs distinctes

### `utilisateur` (12 valeurs)

```
ARKON, ASSTFAM, BEAM, DOREEN, ESTELLE, FAM, GIFT, JOLIE, JULIA, MIND, PLANNING, WELCMGR
```

### `chrono` (12 valeurs)

```
1295, 177, 18, 226, 235, 34, 4, 47, 799, 887, 9, 937
```

### `date_debut_session` (7 valeurs)

```
20251025, 20251130, 20251201, 20251212, 20251222, 20251223, 20251224
```

### `heure_debut_session` (12 valeurs)

```
074516, 080742, 100112, 102113, 111638, 115332, 121429, 145018, 152550, 161457, 163730, 203739
```

### `date_fin_session` (7 valeurs)

```
20251025, 20251130, 20251201, 20251212, 20251222, 20251223, 20251224
```

### `heure_fin_session` (12 valeurs)

```
101730, 102135, 145117, 161941, 163202, 201931, 204011, 204348, 222528, 223851, 230321, 231144
```

### `date_comptable` (1 valeurs)

```
20251224
```

### `pointage` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| tmp_caisse_session_IDX_1 | NONCLUSTERED | oui | utilisateur, chrono |
| tmp_caisse_session_IDX_3 | NONCLUSTERED | non | pointage |
| tmp_caisse_session_IDX_2 | NONCLUSTERED | non | date_comptable |

