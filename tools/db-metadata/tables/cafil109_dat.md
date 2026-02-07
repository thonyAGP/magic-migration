# cafil109_dat

| Info | Valeur |
|------|--------|
| Lignes | 10168 |
| Colonnes | 23 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `numero_compte` | int | 10 | non |  | 3758 |
| 3 | `filiation_compte` | int | 10 | non |  | 18 |
| 4 | `nom_personne` | nvarchar | 15 | non |  | 3739 |
| 5 | `prenom_personne` | nvarchar | 10 | non |  | 7487 |
| 6 | `sexe` | nvarchar | 2 | non |  | 3 |
| 7 | `type_personne` | nvarchar | 1 | non |  | 2 |
| 8 | `type_client` | nvarchar | 1 | non |  | 2 |
| 9 | `numero_adherent` | float | 53 | non |  | 3848 |
| 10 | `lettre_controle` | nvarchar | 1 | non |  | 16 |
| 11 | `filiation_adherent` | int | 10 | non |  | 24 |
| 12 | `date_debut` | char | 8 | non |  | 212 |
| 13 | `date_fin` | char | 8 | non |  | 153 |
| 14 | `millesia` | nvarchar | 1 | non |  | 2 |
| 15 | `liste_blanche` | nvarchar | 1 | non |  | 2 |
| 16 | `date_naissance` | char | 8 | non |  | 7474 |
| 17 | `age` | int | 10 | non |  | 89 |
| 18 | `type_accompagnant` | nvarchar | 1 | non |  | 2 |
| 19 | `numero_accompagnant` | float | 53 | non |  | 753 |
| 20 | `fil_accompagnant` | int | 10 | non |  | 12 |
| 21 | `seminaire` | nvarchar | 20 | non |  | 25 |
| 22 | `valide__o_n_` | nvarchar | 1 | non |  | 2 |
| 23 | `message` | int | 10 | non |  | 4 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `filiation_compte` (18 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 2, 3, 4, 5, 6, 7, 8, 9
```

### `sexe` (3 valeurs)

```
, Me, Mr
```

### `type_personne` (2 valeurs)

```
C, P
```

### `type_client` (2 valeurs)

```
B, C
```

### `lettre_controle` (16 valeurs)

```
, A, C, D, G, J, M, N, P, Q, R, S, T, U, Y, Z
```

### `filiation_adherent` (24 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 18, 19, 2, 20, 21, 22, 3, 4, 5, 6, 7, 8, 83, 9, 93
```

### `millesia` (2 valeurs)

```
, M
```

### `liste_blanche` (2 valeurs)

```
, N
```

### `type_accompagnant` (2 valeurs)

```
, C
```

### `fil_accompagnant` (12 valeurs)

```
0, 1, 12, 15, 2, 3, 4, 5, 6, 7, 8, 9
```

### `seminaire` (25 valeurs)

```
, AdsHelper, BICYCLE GROUP, BIDVEST STEINER, Bidvest Travel Holdi, BIDVEST TRAVEL HOLDI, BRICKS, CM CHINA, DEMERGE (THAILAND) C, Expedia Cruises 1958, G-AsiaPacific Sdn Bh, GLENAIR KOREA, GM TRAVEL DESIGN CO., JKC Travel & Tours S, LASNE VOYAGE, Lion TA , LOREAL KOREA, MEDIATREE COMPANY, NOBITEL, ODINFIN, Pvt, SERVICE CONSTRUCTION, Skyline travel, TELCOM, UNIVANICH PALM OIL P
```

### `valide__o_n_` (2 valeurs)

```
N, O
```

### `message` (4 valeurs)

```
0, 1, 2, 3
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil109_dat_IDX_3 | NONCLUSTERED | non | societe, prenom_personne, nom_personne |
| cafil109_dat_IDX_1 | NONCLUSTERED | oui | societe, numero_compte, filiation_compte |
| cafil109_dat_IDX_2 | NONCLUSTERED | non | societe, nom_personne, prenom_personne, date_debut, date_fin |
| cafil109_dat_IDX_4 | NONCLUSTERED | non | societe, seminaire, date_debut, nom_personne |

