# reponses

**Nom logique Magic** : `reponses`

| Info | Valeur |
|------|--------|
| Lignes | 20133 |
| Colonnes | 12 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `rep_code_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `rep_compte` | int | 10 | non |  | 995 |
| 3 | `rep_filiation` | int | 10 | non |  | 15 |
| 4 | `rep_code_prestation` | nvarchar | 6 | non |  | 4 |
| 5 | `rep_num_questionnaire` | int | 10 | non |  | 2 |
| 6 | `rep_num_categorie` | int | 10 | non |  | 5 |
| 7 | `rep_code_question` | nvarchar | 6 | non |  | 28 |
| 8 | `rep_code_reponse` | nvarchar | 2 | non |  | 1 |
| 9 | `rep_valeur_reponse` | nvarchar | 120 | oui |  | 4072 |
| 10 | `rep_date_maj` | char | 8 | non |  | 79 |
| 11 | `rep_heure_maj` | char | 6 | non |  | 458 |
| 12 | `rep_user_maj` | nvarchar | 8 | non |  | 1 |

## Valeurs distinctes

### `rep_code_societe` (1 valeurs)

```
C
```

### `rep_filiation` (15 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 2, 3, 4, 5, 6, 7, 8, 9
```

### `rep_code_prestation` (4 valeurs)

```
APHU3Y, APHUY1, CLUENF, TIMARR
```

### `rep_num_questionnaire` (2 valeurs)

```
62, 63
```

### `rep_num_categorie` (5 valeurs)

```
1, 2, 3, 4, 5
```

### `rep_code_question` (28 valeurs)

```
QUE004, QUE005, QUE006, QUE007, QUE008, QUE009, QUE010, QUE011, QUE012, QUE013, QUE014, QUE015, QUE016, QUE017, QUE018, QUE019, QUE020, QUE021, QUE022, QUE023, QUE024, QUE025, QUE026, QUE027, QUE028, QUE029, QUE030, QUE031
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| reponses_IDX_1 | NONCLUSTERED | oui | rep_code_societe, rep_compte, rep_filiation, rep_num_questionnaire, rep_num_categorie, rep_code_question |

