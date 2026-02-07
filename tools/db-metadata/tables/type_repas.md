# type_repas

**Nom logique Magic** : `type_repas`

| Info | Valeur |
|------|--------|
| Lignes | 8 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `trep_id` | nvarchar | 10 | non |  | 4 |
| 2 | `trep_libelle` | nvarchar | 30 | non |  | 7 |
| 3 | `trep_nb_repas` | int | 10 | non |  | 3 |
| 4 | `trep_langue` | nvarchar | 3 | non |  | 2 |
| 5 | `trep_nb_jh` | float | 53 | non |  | 3 |

## Valeurs distinctes

### `trep_id` (4 valeurs)

```
MIDI, MIDI SOIR, PTDEJ, SOIR
```

### `trep_libelle` (7 valeurs)

```
BREAKFAST, DAY AND EVENING PACKAGE, DEJEUNER, DINER, FORFAIT JOURNEE ET SOIREE, LUNCH, PETIT DEJEUNER
```

### `trep_nb_repas` (3 valeurs)

```
0, 1, 2
```

### `trep_langue` (2 valeurs)

```
ANG, FRA
```

### `trep_nb_jh` (3 valeurs)

```
0, 0.5, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| type_repas_IDX_1 | NONCLUSTERED | oui | trep_id, trep_langue |

