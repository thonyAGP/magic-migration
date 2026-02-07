# param_task_mw

**Nom logique Magic** : `param_task_mw`

| Info | Valeur |
|------|--------|
| Lignes | 11 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pta_rang` | int | 10 | non |  | 11 |
| 2 | `pta_code_action` | nvarchar | 10 | non |  | 11 |
| 3 | `pta_action_libelle` | nvarchar | 60 | non |  | 11 |
| 4 | `pta_modifiable` | bit |  | non |  | 2 |
| 5 | `pta_public_prog` | nvarchar | 25 | non |  | 11 |
| 6 | `pta_saisissable` | bit |  | non |  | 2 |

## Valeurs distinctes

### `pta_rang` (11 valeurs)

```
10, 100, 110, 20, 30, 40, 50, 60, 70, 80, 90
```

### `pta_code_action` (11 valeurs)

```
ACCOUNT, ECI, EMAIL, ENCODECMP, FILIATION, IDENTITY, OPENLINE, PHONE, POLICE, TRANSAC, VALIDATE
```

### `pta_action_libelle` (11 valeurs)

```
ACTIVATE CLUB MED PASS, ACTIVATE EASY CHECKOUT, FILL POLICE FORM, MANAGE FILIATIONS, OPEN ACCOUNT, OPEN PHONE LINE, SALES, VALIDATE, VERIFY EMAIL ADDRESS, VERIFY IDENTITY, VERIFY PHONE #
```

### `pta_modifiable` (2 valeurs)

```
0, 1
```

### `pta_public_prog` (11 valeurs)

```
EASY_CHECKOUT, EMAIL, ENCODE_CM_PASS, IDENTITY, MANAGE_FILIATION, OPEN_ACCOUNT, OPEN_CLOSE_PHONE_LINE, SALES, VALIDATE_STAY, VERIF_IDENTITY, VERIF_PHONE
```

### `pta_saisissable` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| param_task_mw_IDX_1 | NONCLUSTERED | oui | pta_rang |

