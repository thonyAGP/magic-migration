# stat_jour

**Nom logique Magic** : `stat_jour`

| Info | Valeur |
|------|--------|
| Lignes | 531730 |
| Colonnes | 46 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `sta_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `sta_date` | char | 8 | non |  | 1141 |
| 3 | `sta_nationalite` | nvarchar | 2 | non |  | 42 |
| 4 | `sta_age` | smallint | 5 | non |  | 94 |
| 5 | `sta_nb_mois` | smallint | 5 | non |  | 12 |
| 6 | `sta_handicap` | bit |  | non |  | 1 |
| 7 | `sta_nom` | nvarchar | 30 | non |  | 16117 |
| 8 | `sta_prenom` | nvarchar | 10 | non |  | 39171 |
| 9 | `sta_date_debut_sejour` | char | 8 | non |  | 1113 |
| 10 | `sta_date_fin_sejour` | char | 8 | non |  | 1115 |
| 11 | `sta_qualite` | nvarchar | 3 | non |  | 1 |
| 12 | `sta_qualite_comp` | nvarchar | 4 | non |  | 1 |
| 13 | `sta_num_compte` | int | 10 | non |  | 25822 |
| 14 | `sta_filiation` | int | 10 | non |  | 23 |
| 15 | `sta_lieu_sejour` | nvarchar | 1 | non |  | 2 |
| 16 | `sta_titre` | nvarchar | 2 | non |  | 1 |
| 17 | `sta_pays_residence` | nvarchar | 3 | non |  | 1 |
| 18 | `sta_date_naissance` | char | 8 | non |  | 1 |
| 19 | `sta_pays_naissance` | nvarchar | 3 | non |  | 1 |
| 20 | `sta_date_entree_pays` | char | 8 | non |  | 1 |
| 21 | `sta_turkid` | nvarchar | 30 | non |  | 1 |
| 22 | `sta_piece_id` | nvarchar | 1 | non |  | 1 |
| 23 | `sta_numero_piece` | nvarchar | 30 | non |  | 1 |
| 24 | `sta_pays_delivrance` | nvarchar | 3 | non |  | 1 |
| 25 | `sta_ville_delivrance` | nvarchar | 50 | non |  | 1 |
| 26 | `sta_date_delivrance` | char | 8 | non |  | 1 |
| 27 | `sta_date_validite` | char | 8 | non |  | 1 |
| 28 | `sta_immatriculation` | nvarchar | 30 | non |  | 1 |
| 29 | `sta_adr_libre1` | nvarchar | 35 | non |  | 1 |
| 30 | `sta_adr_libre2` | nvarchar | 35 | non |  | 1 |
| 31 | `sta_adr_bat_esc` | nvarchar | 10 | non |  | 1 |
| 32 | `sta_num_de_la_rue` | nvarchar | 10 | non |  | 1 |
| 33 | `sta_nom_de_la_rue` | nvarchar | 30 | non |  | 1 |
| 34 | `sta_nom_commune` | nvarchar | 35 | non |  | 1 |
| 35 | `sta_code_postal` | nvarchar | 10 | non |  | 1 |
| 36 | `sta_bureau_dis` | nvarchar | 30 | non |  | 1 |
| 37 | `sta_etat_province` | nvarchar | 10 | non |  | 1 |
| 38 | `sta_ville_origine` | nvarchar | 30 | non |  | 1 |
| 39 | `sta_etat_origine` | nvarchar | 30 | non |  | 1 |
| 40 | `sta_pays_avant` | nvarchar | 2 | non |  | 1 |
| 41 | `sta_pays_apres` | nvarchar | 2 | non |  | 1 |
| 42 | `sta_etat_avant` | nvarchar | 60 | non |  | 1 |
| 43 | `sta_etat_apres` | nvarchar | 60 | non |  | 1 |
| 44 | `sta_ville_avant` | nvarchar | 60 | non |  | 1 |
| 45 | `sta_ville_apres` | nvarchar | 60 | non |  | 1 |
| 46 | `sta_nom_logement` | nvarchar | 6 | non |  | 1 |

## Valeurs distinctes

### `sta_societe` (1 valeurs)

```
C
```

### `sta_nationalite` (42 valeurs)

```
@@, AL, AR, AT, AU, BQ, BR, CD, CH, CL, CO, ES, FR, GB, HK, ID, IO, IR, IS, IT, JP, LB, MA, MO, MX, MY, NL, NZ, PI, PL, PO, RU, SA, SG, SN, SU, TH, TR, TW, UK, US, ZA
```

### `sta_nb_mois` (12 valeurs)

```
0, 1, 10, 11, 2, 3, 4, 5, 6, 7, 8, 9
```

### `sta_handicap` (1 valeurs)

```
0
```

### `sta_qualite` (1 valeurs)

```
GM
```

### `sta_qualite_comp` (1 valeurs)

```
ORDI
```

### `sta_filiation` (23 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 3, 4, 5, 6, 7, 8, 9
```

### `sta_lieu_sejour` (2 valeurs)

```
, G
```

### `sta_date_naissance` (1 valeurs)

```
00000000
```

### `sta_date_entree_pays` (1 valeurs)

```
00000000
```

### `sta_date_delivrance` (1 valeurs)

```
00000000
```

### `sta_date_validite` (1 valeurs)

```
00000000
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| stat_jour_IDX_1 | NONCLUSTERED | oui | sta_societe, sta_date, sta_num_compte, sta_filiation |

