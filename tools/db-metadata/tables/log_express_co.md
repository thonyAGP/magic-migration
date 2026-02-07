# log_express_co

**Nom logique Magic** : `log_express_co`

| Info | Valeur |
|------|--------|
| Lignes | 3933 |
| Colonnes | 22 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `leo_row_id` | int | 10 | non |  | 3933 |
| 2 | `leo_date_traitement` | char | 8 | non |  | 419 |
| 3 | `leo_heure_traitement` | char | 6 | non |  | 1342 |
| 4 | `leo_user` | nvarchar | 8 | non |  | 7 |
| 5 | `leo_compte` | int | 10 | non |  | 3121 |
| 6 | `leo_filiation` | int | 10 | non |  | 9 |
| 7 | `leo_nom` | nvarchar | 30 | non |  | 1839 |
| 8 | `leo_prenom` | nvarchar | 20 | non |  | 2581 |
| 9 | `leo_email` | nvarchar | 100 | non |  | 549 |
| 10 | `leo_dossier` | nvarchar | 32 | non |  | 3309 |
| 11 | `leo_transaction_validee` | bit |  | non |  | 2 |
| 12 | `leo_message_erreur` | nvarchar | 250 | non |  | 5 |
| 13 | `leo_creation_lsd` | bit |  | non |  | 2 |
| 14 | `leo_creation_exc` | bit |  | non |  | 2 |
| 15 | `leo_maj_solde` | bit |  | non |  | 2 |
| 16 | `leo_des_tel` | int | 10 | non |  | 2 |
| 17 | `leo_des_ezcard` | int | 10 | non |  | 10 |
| 18 | `leo_creation_fac` | bit |  | non |  | 2 |
| 19 | `leo_fac_filename` | nvarchar | 256 | non |  | 537 |
| 20 | `leo_envoi_mail` | bit |  | non |  | 2 |
| 21 | `leo_test_pes` | bit |  | non |  | 2 |
| 22 | `leo_montant` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `leo_user` (7 valeurs)

```
ARKON, DSIOP, MICKY, NANA, TEMMY, TOMOKA, WELCMGR
```

### `leo_filiation` (9 valeurs)

```
0, 1, 2, 3, 4, 5, 6, 8, 9
```

### `leo_transaction_validee` (2 valeurs)

```
0, 1
```

### `leo_message_erreur` (5 valeurs)

```
, Error checking Red Dot response: Invalid signature from Red Dot response, failed, java.io.EOFException, payer_email could not be found
```

### `leo_creation_lsd` (2 valeurs)

```
0, 1
```

### `leo_creation_exc` (2 valeurs)

```
0, 1
```

### `leo_maj_solde` (2 valeurs)

```
0, 1
```

### `leo_des_tel` (2 valeurs)

```
0, 1
```

### `leo_des_ezcard` (10 valeurs)

```
0, 1, 11, 2, 3, 4, 5, 6, 7, 8
```

### `leo_creation_fac` (2 valeurs)

```
0, 1
```

### `leo_envoi_mail` (2 valeurs)

```
0, 1
```

### `leo_test_pes` (2 valeurs)

```
0, 1
```

### `leo_montant` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_express_co_IDX_1 | NONCLUSTERED | oui | leo_row_id |

