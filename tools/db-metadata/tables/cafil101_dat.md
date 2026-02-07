# cafil101_dat

| Info | Valeur |
|------|--------|
| Lignes | 1116 |
| Colonnes | 14 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `numero_compte` | int | 10 | non |  | 713 |
| 3 | `filiation` | int | 10 | non |  | 12 |
| 4 | `message_lu` | nvarchar | 1 | non |  | 2 |
| 5 | `logement` | nvarchar | 6 | non |  | 1 |
| 6 | `nom_personne` | nvarchar | 30 | oui |  | 618 |
| 7 | `prenom_personne` | nvarchar | 20 | oui |  | 796 |
| 8 | `date_emission` | char | 8 | non |  | 115 |
| 9 | `heure_emission` | char | 6 | non |  | 1093 |
| 10 | `provenance` | nvarchar | 10 | non |  | 22 |
| 11 | `numero_message` | int | 10 | non |  | 1116 |
| 12 | `message` | nvarchar | 73 | non |  | 770 |
| 13 | `titre` | nvarchar | 50 | non |  | 1 |
| 14 | `type_message` | nvarchar | 1 | oui |  | 0 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `filiation` (12 valeurs)

```
0, 1, 10, 13, 14, 2, 3, 4, 5, 6, 7, 9
```

### `message_lu` (2 valeurs)

```
N, O
```

### `provenance` (22 valeurs)

```
ARKON, BARMGR, BEAM, DOREEN, ESTELLE, EXC, GIFT, JAA, JOLIE, JULIA, MICKY, MIND, NANA, NUENG, REMI, REST, RITA, TEMMY, TOMOKA, TRAFFIC, TRAINEE, YAYA
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil101_dat_IDX_3 | NONCLUSTERED | non | societe, nom_personne, prenom_personne, message_lu |
| cafil101_dat_IDX_1 | NONCLUSTERED | non | societe, numero_compte, filiation, message_lu |
| cafil101_dat_IDX_4 | NONCLUSTERED | oui | societe, numero_message, message_lu |
| cafil101_dat_IDX_2 | NONCLUSTERED | non | societe, logement, message_lu |

