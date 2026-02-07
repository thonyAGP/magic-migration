# cafil082_dat

| Info | Valeur |
|------|--------|
| Lignes | 504 |
| Colonnes | 15 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `nom_standard` | nvarchar | 6 | non |  | 504 |
| 3 | `zone_de_menage` | nvarchar | 3 | non |  | 16 |
| 4 | `secteur_de_menage` | nvarchar | 3 | non |  | 36 |
| 5 | `pont_evacuation` | nvarchar | 2 | non |  | 1 |
| 6 | `poste_evacuation` | nvarchar | 2 | non |  | 1 |
| 7 | `point_bagage` | nvarchar | 2 | non |  | 1 |
| 8 | `messagerie` | nvarchar | 1 | non |  | 1 |
| 9 | `num_poste_alpha` | nvarchar | 6 | non |  | 477 |
| 10 | `num_ligne` | int | 10 | non |  | 1 |
| 11 | `num_poste` | int | 10 | non |  | 477 |
| 12 | `telephone_exterieur` | nvarchar | 15 | non |  | 1 |
| 13 | `fax` | nvarchar | 15 | non |  | 1 |
| 14 | `telex` | nvarchar | 15 | non |  | 1 |
| 15 | `puissance_electrique` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `code_societe` (1 valeurs)

```
C
```

### `zone_de_menage` (16 valeurs)

```
Z00, Z01, Z02, Z03, Z04, Z05, Z06, Z07, Z08, Z09, Z10, Z11, Z12, Z13, Z14, Z15
```

### `secteur_de_menage` (36 valeurs)

```
S00, S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25, S26, S27, S28, S29, S30, S31, S32, S33, S34, S90
```

### `num_ligne` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil082_dat_IDX_2 | NONCLUSTERED | oui | code_societe, zone_de_menage, nom_standard |
| cafil082_dat_IDX_4 | NONCLUSTERED | non | num_poste |
| cafil082_dat_IDX_1 | NONCLUSTERED | oui | code_societe, nom_standard |
| cafil082_dat_IDX_3 | NONCLUSTERED | oui | code_societe, secteur_de_menage, nom_standard |

