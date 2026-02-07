# rais_abs

| Info | Valeur |
|------|--------|
| Lignes | 9 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_raison` | nvarchar | 2 | non |  | 9 |
| 2 | `libelle_raison` | nvarchar | 50 | non |  | 9 |
| 3 | `qualite_raison` | nvarchar | 2 | non |  | 2 |
| 4 | `libelle_raison_en` | nvarchar | 50 | non |  | 9 |

## Valeurs distinctes

### `code_raison` (9 valeurs)

```
01, 02, 03, 04, 05, 06, 07, 08, 09
```

### `libelle_raison` (9 valeurs)

```
Accompagnant hÃ´pital, Arret maladie, Autre, Conges, Divers, Hopital / MÃ©dical, SÃ©jour dans un autre village, Stage / Formation, Visa / Passeport
```

### `qualite_raison` (2 valeurs)

```
GM, GO
```

### `libelle_raison_en` (9 valeurs)

```
Hospital / Medical, Hospital attendant, Miscellaneous, Other, Sick leave, Stay in another resort, Training, Vacation, Visa / Passport
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| rais_abs_IDX_1 | NONCLUSTERED | oui | code_raison |

