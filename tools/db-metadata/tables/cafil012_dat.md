# cafil012_dat

| Info | Valeur |
|------|--------|
| Lignes | 31553 |
| Colonnes | 32 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `heb_societe` | nvarchar | 1 | non |  | 2 |
| 2 | `heb_num_compte` | int | 10 | non |  | 3815 |
| 3 | `heb_filiation` | int | 10 | non |  | 69 |
| 4 | `heb_code_package` | nvarchar | 1 | non |  | 4 |
| 5 | `heb_statut_sejour` | nvarchar | 1 | non |  | 2 |
| 6 | `heb_date_debut` | char | 8 | non |  | 341 |
| 7 | `heb_heure_debut` | nvarchar | 2 | non |  | 25 |
| 8 | `heb_date_fin` | char | 8 | non |  | 319 |
| 9 | `heb_heure_fin` | nvarchar | 2 | non |  | 27 |
| 10 | `heb_u_p_nb_occup` | nvarchar | 3 | oui |  | 19 |
| 11 | `heb_type_hebergement` | nvarchar | 6 | non |  | 32 |
| 12 | `heb_complement_type` | nvarchar | 4 | non |  | 17 |
| 13 | `heb_libelle` | nvarchar | 51 | non |  | 10252 |
| 14 | `heb_age` | nvarchar | 1 | non |  | 101 |
| 15 | `heb_nationalite` | nvarchar | 2 | non |  | 46 |
| 16 | `heb_nom_logement` | nvarchar | 6 | non |  | 641 |
| 17 | `heb_code_sexe` | nvarchar | 1 | non |  | 4 |
| 18 | `heb_code_fumeur` | nvarchar | 1 | non |  | 4 |
| 19 | `heb_lieu_de_sejour` | nvarchar | 1 | non |  | 3 |
| 20 | `heb_code_logement` | nvarchar | 6 | non |  | 16 |
| 21 | `heb_compactage` | nvarchar | 1 | non |  | 3 |
| 22 | `heb_age_num` | int | 10 | non |  | 89 |
| 23 | `heb_age_nb_mois` | int | 10 | non |  | 12 |
| 24 | `heb_affec_auto` | nvarchar | 1 | non |  | 2 |
| 25 | `heb_affec_comment` | nvarchar | 200 | non |  | 1 |
| 26 | `heb_oldlgt` | nvarchar | 6 | non |  | 1 |
| 27 | `heb_pyr_status` | nvarchar | 1 | non |  | 1 |
| 28 | `heb_liberation_chambre` | varchar | 6 | non |  | 455 |
| 29 | `heb_annul_liberation` | varchar | 6 | non |  | 12 |
| 30 | `heb_affichage_logement` | bit |  | non |  | 2 |
| 31 | `heb_rbr_id` | smallint | 5 | non |  | 1 |
| 32 | `heb_operateur` | nvarchar | 8 | non |  | 1 |

## Valeurs distinctes

### `heb_societe` (2 valeurs)

```
, C
```

### `heb_code_package` (4 valeurs)

```
A, H, W, Z
```

### `heb_statut_sejour` (2 valeurs)

```
N, P
```

### `heb_heure_debut` (25 valeurs)

```
,  0,  6,  9, 00, 03, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
```

### `heb_heure_fin` (27 valeurs)

```
,  0,  4,  5,  6,  7,  8,  9, 00, 03, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
```

### `heb_u_p_nb_occup` (19 valeurs)

```
, , #, CF, DR, ND, P1, P2, P4, RF, TO, U1, U2, U3, U4, U5, U6, V, WT
```

### `heb_type_hebergement` (32 valeurs)

```
, 1FR, AUH, BKK, BRU, CAN, CNX, DEL, DOH, DPS, DXB, G2E, GM, GO, HEL, HGH, HKG, ICN, IST, KUL, MEL, PEK, PEN, PER, PVG, SIN, SYD, TFU, TL3, TPE, XX, ZRH
```

### `heb_complement_type` (17 valeurs)

```
, ANS, ARTI, CLUB, DOCT, EDUC, GE, IGP, IGP2, MISS, ORDI, PROP, SEM, STAG, VILL, VSL, XXXX
```

### `heb_nationalite` (46 valeurs)

```
, @@, AL, AS, AT, AU, BQ, BR, CD, CH, CO, CS, ES, FR, GB, HK, ID, IM, IO, IR, IS, IT, JP, MA, MO, MU, MW, MX, MY, NL, NZ, PH, PI, PL, RU, SA, SG, SN, SU, TH, TR, TU, TW, US, ZA, ZI
```

### `heb_code_sexe` (4 valeurs)

```
, Â», F, H
```

### `heb_code_fumeur` (4 valeurs)

```
, Â«, N, O
```

### `heb_lieu_de_sejour` (3 valeurs)

```
, *, G
```

### `heb_code_logement` (16 valeurs)

```
, A2+A2, A2A, B2+B2A, B2A, B4, B4T, C2+C2A, C2A, C2A+, G2, GO, H2, H4, S2+B2A, S2A
```

### `heb_compactage` (3 valeurs)

```
, N, W
```

### `heb_age_nb_mois` (12 valeurs)

```
0, 1, 10, 11, 2, 3, 4, 5, 6, 7, 8, 9
```

### `heb_affec_auto` (2 valeurs)

```
, N
```

### `heb_annul_liberation` (12 valeurs)

```
000000, 110000, 140000, 150000, 160000, 170000, 180000, 190000, 200000, 210000, 220000, 230000
```

### `heb_affichage_logement` (2 valeurs)

```
0, 1
```

### `heb_rbr_id` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil012_dat_IDX_3 | NONCLUSTERED | non | heb_societe, heb_code_package, heb_nom_logement, heb_date_debut |
| cafil012_dat_IDX_1 | NONCLUSTERED | oui | heb_societe, heb_num_compte, heb_filiation, heb_date_debut, heb_code_package |
| cafil012_dat_IDX_4 | NONCLUSTERED | non | heb_societe, heb_code_package, heb_libelle, heb_statut_sejour, heb_date_debut |
| cafil012_dat_IDX_2 | NONCLUSTERED | oui | heb_societe, heb_num_compte, heb_filiation, heb_date_fin, heb_code_package |

