# effectif_personnes

**Nom logique Magic** : `effectif_personnes`

| Info | Valeur |
|------|--------|
| Lignes | 343624 |
| Colonnes | 25 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `efp_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `efp_compte` | float | 53 | non |  | 95365 |
| 3 | `efp_filiation` | smallint | 5 | non |  | 49 |
| 4 | `efp_date` | char | 8 | non |  | 107 |
| 5 | `efp_qualite` | nvarchar | 6 | non |  | 2 |
| 6 | `efq_qua_compl` | nvarchar | 4 | non |  | 17 |
| 7 | `efp_nom` | nvarchar | 30 | non |  | 40545 |
| 8 | `efp_prenom` | nvarchar | 19 | non |  | 96226 |
| 9 | `efp_dossier` | int | 10 | non |  | 66416 |
| 10 | `efp_date_naissance` | char | 8 | non |  | 29749 |
| 11 | `efp_date_debut_sejour` | char | 8 | non |  | 2778 |
| 12 | `efp_date_fin_sejour` | char | 8 | non |  | 2764 |
| 13 | `efp_code_logement` | nvarchar | 6 | non |  | 26 |
| 14 | `efp_facturable` | nvarchar | 1 | non |  | 3 |
| 15 | `efp_fonction` | nvarchar | 25 | non |  | 275 |
| 16 | `efp_valide` | nvarchar | 1 | non |  | 2 |
| 17 | `efp_lieu_sejour` | nvarchar | 1 | non |  | 1 |
| 18 | `efp_heure_debut` | nvarchar | 2 | non |  | 35 |
| 19 | `efp_heure_fin` | nvarchar | 2 | non |  | 36 |
| 20 | `efp_qte_vv` | float | 53 | non |  | 2 |
| 21 | `efp_qte_non_vv` | float | 53 | non |  | 2 |
| 22 | `efp_chambre` | nvarchar | 6 | non |  | 753 |
| 23 | `efp_passeport` | nvarchar | 30 | non |  | 32375 |
| 24 | `efp_nationalite` | nvarchar | 2 | non |  | 63 |
| 25 | `efp_ste_prestataire` | nvarchar | 50 | oui |  | 1 |

## Valeurs distinctes

### `efp_societe` (1 valeurs)

```
C
```

### `efp_filiation` (49 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 3, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 4, 40, 41, 42, 43, 44, 45, 46, 47, 48, 5, 6, 7, 8, 9
```

### `efp_qualite` (2 valeurs)

```
GM, GO
```

### `efq_qua_compl` (17 valeurs)

```
ANS, ARTI, CLUB, DOCT, EDUC, GE, IGP, IGP2, LOC, MISS, ORDI, PRES, PROP, SEM, STAG, VILL, VSL
```

### `efp_code_logement` (26 valeurs)

```
, A2, A2+, A2+A2, A2A, B2, B2+B2, B2+B2A, B2A, B4, B4T, C2, C2+, C2+C2, C2+C2A, C2A, C2A+, G2, GO, H2, H4, S2, S2+A2, S2+B2, S2+B2A, S2A
```

### `efp_facturable` (3 valeurs)

```
, N, O
```

### `efp_valide` (2 valeurs)

```
N, O
```

### `efp_heure_debut` (35 valeurs)

```
,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 00, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
```

### `efp_heure_fin` (36 valeurs)

```
,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 00, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24
```

### `efp_qte_vv` (2 valeurs)

```
0, 1
```

### `efp_qte_non_vv` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| effectif_personnes_IDX_1 | NONCLUSTERED | oui | efp_societe, efp_compte, efp_filiation, efp_qualite, efq_qua_compl, efp_date, efp_date_debut_sejour, efp_date_fin_sejour, efp_lieu_sejour |

