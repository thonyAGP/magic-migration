# log_ajustement_effectifs

**Nom logique Magic** : `log_ajustement_effectifs`

| Info | Valeur |
|------|--------|
| Lignes | 56 |
| Colonnes | 13 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `lae_date_consommation` | char | 8 | non |  | 11 |
| 2 | `lae_indicateur_repas_sejour` | nvarchar | 1 | non |  | 1 |
| 3 | `lae_qualite` | nvarchar | 3 | non |  | 3 |
| 4 | `lae_qualite_complementaire` | nvarchar | 4 | non |  | 12 |
| 5 | `lae_code_repas` | nvarchar | 6 | non |  | 1 |
| 6 | `lae_type_repas` | nvarchar | 3 | non |  | 2 |
| 7 | `lae_groupe` | nvarchar | 50 | non |  | 1 |
| 8 | `lae_quantite_repas` | int | 10 | non |  | 19 |
| 9 | `lae_date_saisie` | char | 8 | non |  | 10 |
| 10 | `lae_heure_saisie` | char | 6 | non |  | 27 |
| 11 | `lae_raison` | nvarchar | 100 | non |  | 25 |
| 12 | `lae_user_saisie` | nvarchar | 8 | non |  | 2 |
| 13 | `lae_lieu_sejour` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `lae_date_consommation` (11 valeurs)

```
20240220, 20240227, 20240317, 20240529, 20240628, 20240729, 20240829, 20240928, 20241124, 20251126, 20251128
```

### `lae_indicateur_repas_sejour` (1 valeurs)

```
Q
```

### `lae_qualite` (3 valeurs)

```
GM, GO, IGR
```

### `lae_qualite_complementaire` (12 valeurs)

```
ANS, ARTI, EXC, GE, HCMB, IGP, IGP2, MISS, ORDI, SEM, STAG, VILL
```

### `lae_type_repas` (2 valeurs)

```
DEJ, DIN
```

### `lae_quantite_repas` (19 valeurs)

```
0, 1, -1, -15, -16, 2, -2, 23, 3, -3, 4, -4, 5, -5, 7, -7, 8, -8, -9
```

### `lae_date_saisie` (10 valeurs)

```
20240301, 20240331, 20240601, 20240701, 20240801, 20240901, 20241001, 20241127, 20251129, 20251201
```

### `lae_heure_saisie` (27 valeurs)

```
111035, 111312, 111953, 112934, 113105, 113128, 113244, 113346, 114003, 114158, 114204, 114347, 114359, 131058, 131905, 134356, 134433, 134503, 142607, 142659, 143202, 145819, 150029, 150112, 151357, 152053, 163804
```

### `lae_raison` (25 valeurs)

```
0.5 JH MORE IN CMA, 0.5JH MORE IN GO MISSION, -31 JH FROM THE GOOD JH, adjust from IGP to IGP2 for GO vacation SARIF, adjustment, ADJUSTMENT, ADJUSTMENT / JH MORE IN EOM, ADJUSTMENT FOR EOM, adjustment for IGP2, adjustment for IGP2 / 0.5 JH not matching with the big table and the small one for IGP/IGP2, ADJUSTMENT IGP, THERE WERE EARLY DEPARTURE, adjustment, GO artist 1day early departure and interrupted late and therefore need to adjust., devalidation, LATE VALIDATION, minus 1.0 in the effectiff, MINUS 2 JH FOR EARLY DEPARTURE, MINUS 2.5 FROM THE ACTUAL JH NUMBER, minus 23 jh from the big table, MINUS 7.5 JH FROM ACTUAL JH, MISTAKEN TO PUT WRONG JH, recodification adjustment, TO INPUT ABSCENE AND LATE VALIDATION OF GO, VALIDATION 2ND DAY AFTER TRAINEE ARRIVED. ADJUSTMENT OF 4 MEALS, VALIDATION OF GO MISSION NAME ON 3RD DAY. ASJUST 6 MEALS, ZHOU LI. VALIDATION OF GM NAME ON SECOND DAY- ADJUST 3 MEALS
```

### `lae_user_saisie` (2 valeurs)

```
PLANNING, SNOW
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_ajustement_effectifs_IDX_1 | NONCLUSTERED | oui | lae_date_consommation, lae_date_saisie, lae_qualite, lae_qualite_complementaire, lae_code_repas, lae_type_repas, lae_groupe, lae_lieu_sejour |

