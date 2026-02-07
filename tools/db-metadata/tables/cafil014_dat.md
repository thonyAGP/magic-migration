# cafil014_dat

| Info | Valeur |
|------|--------|
| Lignes | 9733 |
| Colonnes | 26 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `gm_nom` | nvarchar | 15 | non |  | 3408 |
| 2 | `gm_prenom` | nvarchar | 10 | non |  | 7175 |
| 3 | `gm_sexe` | nvarchar | 1 | non |  | 2 |
| 4 | `gm_type_client` | nvarchar | 1 | non |  | 2 |
| 5 | `gm_num_club` | float | 53 | non |  | 3534 |
| 6 | `gm_lettre_controle` | nvarchar | 1 | non |  | 16 |
| 7 | `gm_filiation_club` | int | 10 | non |  | 23 |
| 8 | `gm_code_fidelite` | nvarchar | 8 | non |  | 2 |
| 9 | `gm_liste_blanche` | nvarchar | 1 | non |  | 2 |
| 10 | `gm_titre` | nvarchar | 2 | non |  | 3 |
| 11 | `gm_age` | int | 10 | non |  | 89 |
| 12 | `gm_date_naissance` | char | 8 | non |  | 7391 |
| 13 | `gm_nationalite` | nvarchar | 2 | non |  | 36 |
| 14 | `gm_fumeur` | nvarchar | 1 | non |  | 1 |
| 15 | `gm_societe` | nvarchar | 1 | non |  | 1 |
| 16 | `gm_compte` | int | 10 | non |  | 3444 |
| 17 | `gm_filiation` | int | 10 | non |  | 18 |
| 18 | `gm_type_accompagnant` | nvarchar | 1 | non |  | 2 |
| 19 | `gm_num_accompagnant` | float | 53 | non |  | 753 |
| 20 | `gm_filiation_accompa` | int | 10 | non |  | 12 |
| 21 | `gm_seminaire` | nvarchar | 20 | non |  | 24 |
| 22 | `gm_date_debut` | char | 8 | non |  | 114 |
| 23 | `gm_date_fin` | char | 8 | non |  | 121 |
| 24 | `gm_statut_identite` | nvarchar | 1 | non |  | 1 |
| 25 | `gm_statut_creation` | nvarchar | 1 | non |  | 2 |
| 26 | `gm_ste_prestataire` | nvarchar | 50 | non |  | 1 |

## Valeurs distinctes

### `gm_sexe` (2 valeurs)

```
F, H
```

### `gm_type_client` (2 valeurs)

```
B, C
```

### `gm_lettre_controle` (16 valeurs)

```
, A, C, D, G, J, M, N, P, Q, R, S, T, U, Y, Z
```

### `gm_filiation_club` (23 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 18, 19, 2, 20, 21, 22, 3, 4, 5, 6, 7, 8, 83, 9, 93
```

### `gm_code_fidelite` (2 valeurs)

```
, M
```

### `gm_liste_blanche` (2 valeurs)

```
, N
```

### `gm_titre` (3 valeurs)

```
, Me, Mr
```

### `gm_nationalite` (36 valeurs)

```
@@, AL, AT, AU, BQ, BR, CD, CH, CO, ES, FR, GB, HK, ID, IO, IR, IS, IT, JP, MA, MO, MY, NL, NZ, PI, PL, RU, SA, SG, SN, SU, TH, TR, TW, US, ZA
```

### `gm_fumeur` (1 valeurs)

```
N
```

### `gm_societe` (1 valeurs)

```
C
```

### `gm_filiation` (18 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 2, 3, 4, 5, 6, 7, 8, 9
```

### `gm_type_accompagnant` (2 valeurs)

```
, C
```

### `gm_filiation_accompa` (12 valeurs)

```
0, 1, 12, 15, 2, 3, 4, 5, 6, 7, 8, 9
```

### `gm_seminaire` (24 valeurs)

```
, AdsHelper, BICYCLE GROUP, BIDVEST STEINER, Bidvest Travel Holdi, BIDVEST TRAVEL HOLDI, BRICKS, CM CHINA, DEMERGE (THAILAND) C, Expedia Cruises 1958, G-AsiaPacific Sdn Bh, GLENAIR KOREA, GM TRAVEL DESIGN CO., JKC Travel & Tours S, LASNE VOYAGE, Lion TA , LOREAL KOREA, MEDIATREE COMPANY, NOBITEL, ODINFIN, Pvt, Skyline travel, TELCOM, UNIVANICH PALM OIL P
```

### `gm_statut_identite` (1 valeurs)

```
N
```

### `gm_statut_creation` (2 valeurs)

```
A, M
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil014_dat_IDX_1 | NONCLUSTERED | non | gm_societe, gm_nom, gm_prenom |
| cafil014_dat_IDX_6 | NONCLUSTERED | non | gm_societe, gm_date_fin, gm_nom, gm_prenom |
| cafil014_dat_IDX_3 | NONCLUSTERED | oui | gm_societe, gm_type_client, gm_num_club, gm_filiation_club |
| cafil014_dat_IDX_5 | NONCLUSTERED | non | gm_societe, gm_date_debut, gm_nom, gm_prenom |
| cafil014_dat_IDX_2 | NONCLUSTERED | non | gm_societe, gm_prenom, gm_nom |
| cafil014_dat_IDX_4 | NONCLUSTERED | oui | gm_societe, gm_compte, gm_filiation |

