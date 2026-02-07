# valeur_reponse

**Nom logique Magic** : `valeur_reponse`

| Info | Valeur |
|------|--------|
| Lignes | 110 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `vre_type_question` | nvarchar | 6 | non |  | 14 |
| 2 | `vre_categorie_reponse` | int | 10 | non |  | 3 |
| 3 | `vre_code_reponse` | nvarchar | 2 | non |  | 43 |
| 4 | `vre_valeur_reponse` | nvarchar | 60 | non |  | 91 |
| 5 | `vre_valeur_reponse_anglais` | nvarchar | 60 | non |  | 89 |

## Valeurs distinctes

### `vre_type_question` (14 valeurs)

```
ALLERG, CASQUE, COUCHE, LISALL, NIVCOE, NIVCOU, NIVPRA, OUINON, POSPLA, SIESTE, SOMMEI, TYPCOU, TYPGLI, TYPPRA
```

### `vre_categorie_reponse` (3 valeurs)

```
0, 1, 2
```

### `vre_code_reponse` (43 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 3, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 4, 40, 41, 42, 43, 5, 6, 7, 8, 9
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| valeur_reponse_IDX_1 | NONCLUSTERED | oui | vre_type_question, vre_categorie_reponse, vre_code_reponse |

