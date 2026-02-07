# import_go_sequence

**Nom logique Magic** : `import_go_sequence`

| Info | Valeur |
|------|--------|
| Lignes | 4 |
| Colonnes | 13 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `impgos_id` | int | 10 | non |  | 4 |
| 2 | `impgos_date_import` | char | 8 | non |  | 1 |
| 3 | `impgos_heure_import` | char | 6 | non |  | 4 |
| 4 | `impgos_user` | nvarchar | 20 | non |  | 1 |
| 5 | `impgos_nom_fichier` | nvarchar | 255 | non |  | 1 |
| 6 | `impgos_nbre_enregistrement` | int | 10 | non |  | 1 |
| 7 | `impgos_type_traitement` | nvarchar | 1 | non |  | 1 |
| 8 | `impgos_type_validation` | nvarchar | 1 | non |  | 1 |
| 9 | `impgos_nombre_import` | int | 10 | non |  | 1 |
| 10 | `impgos_etat_import` | nvarchar | 10 | non |  | 1 |
| 11 | `impgos_traitement_chambre` | bit |  | non |  | 1 |
| 12 | `impgos_traitement_table` | bit |  | non |  | 1 |
| 13 | `impgos_traitement_automatique` | bit |  | non |  | 1 |

## Valeurs distinctes

### `impgos_id` (4 valeurs)

```
1, 2, 3, 4
```

### `impgos_date_import` (1 valeurs)

```
20220303
```

### `impgos_heure_import` (4 valeurs)

```
094557, 094614, 094634, 094801
```

### `impgos_user` (1 valeurs)

```
Welcome MGR
```

### `impgos_nom_fichier` (1 valeurs)

```
C:\Users\PHUCPLAN01\OneDrive - ClubMedOffice\Desktop\WD PMS.csv
```

### `impgos_nbre_enregistrement` (1 valeurs)

```
0
```

### `impgos_type_traitement` (1 valeurs)

```
1
```

### `impgos_type_validation` (1 valeurs)

```
N
```

### `impgos_nombre_import` (1 valeurs)

```
0
```

### `impgos_etat_import` (1 valeurs)

```
O
```

### `impgos_traitement_chambre` (1 valeurs)

```
0
```

### `impgos_traitement_table` (1 valeurs)

```
1
```

### `impgos_traitement_automatique` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| import_go_sequence_IDX_1 | NONCLUSTERED | oui | impgos_id |
| import_go_sequence_IDX_2 | NONCLUSTERED | non | impgos_date_import, impgos_heure_import, impgos_user |

