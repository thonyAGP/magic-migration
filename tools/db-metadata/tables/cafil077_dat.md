# cafil077_dat

| Info | Valeur |
|------|--------|
| Lignes | 23 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `obj_societe` | nvarchar | 1 | non |  | 5 |
| 2 | `obj_code_objet` | int | 10 | non |  | 7 |
| 3 | `obj_libelle` | nvarchar | 20 | non |  | 7 |
| 4 | `obj_code_droit_modif` | nvarchar | 1 | non |  | 2 |

## Valeurs distinctes

### `obj_societe` (5 valeurs)

```
A, B, C, D, G
```

### `obj_code_objet` (7 valeurs)

```
1, 2, 3, 4, 5, 6, 7
```

### `obj_libelle` (7 valeurs)

```
Billet d'avion, Carte de crÃ©dit, ChÃ©quier, Drivers Licence, ID, Jewellery, Passeport
```

### `obj_code_droit_modif` (2 valeurs)

```
, O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil077_dat_IDX_1 | NONCLUSTERED | oui | obj_societe, obj_code_objet |

