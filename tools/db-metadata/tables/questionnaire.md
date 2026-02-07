# questionnaire

**Nom logique Magic** : `questionnaire`

| Info | Valeur |
|------|--------|
| Lignes | 206 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `que_type_questionnaire` | nvarchar | 4 | non |  | 23 |
| 2 | `que_num_questionnaire` | int | 10 | non |  | 6 |
| 3 | `que_num_categorie` | int | 10 | non |  | 10 |
| 4 | `que_type_question` | nvarchar | 2 | non |  | 51 |
| 5 | `que_code_question` | nvarchar | 6 | non |  | 39 |
| 6 | `que_libelle_question` | nvarchar | 60 | non |  | 71 |

## Valeurs distinctes

### `que_type_questionnaire` (23 valeurs)

```
ALRG, BABY, CRBO, CRLS, CRSA, CRSE, CRST, FPOT, FYAR, JU11, JU14, LBSN, LCAA, LCMO, LCRA, LCSK, LSKA, LSKE, LSNA, LSNE, MIN8, MINI, STAG
```

### `que_num_questionnaire` (6 valeurs)

```
103, 104, 60, 61, 62, 63
```

### `que_num_categorie` (10 valeurs)

```
1, 10, 2, 3, 4, 5, 6, 7, 8, 9
```

### `que_code_question` (39 valeurs)

```
DATDEB, DATFIN, DATNAI, DTEPAS, DTFPAS, NATION, NUMDOC, NUMPAS, PAYDEL, QUE004, QUE005, QUE006, QUE007, QUE008, QUE009, QUE010, QUE011, QUE012, QUE013, QUE014, QUE015, QUE016, QUE017, QUE018, QUE019, QUE020, QUE021, QUE022, QUE023, QUE024, QUE025, QUE026, QUE027, QUE028, QUE029, QUE030, QUE031, TYPDOC, VILNAI
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| questionnaire_IDX_1 | NONCLUSTERED | oui | que_num_questionnaire, que_num_categorie, que_code_question |

