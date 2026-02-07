# caisse_eledetail_cloture

| Info | Valeur |
|------|--------|
| Lignes | 17 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `_ordre_affichage` | int | 10 | non |  | 17 |
| 2 | `_type` | nvarchar | 1 | non |  | 4 |
| 3 | `_quand` | nvarchar | 1 | non |  | 4 |
| 4 | `_quoi` | nvarchar | 3 | non |  | 6 |
| 5 | `_libelle_fra` | nvarchar | 32 | non |  | 10 |
| 6 | `_libelle_ang` | nvarchar | 32 | non |  | 8 |
| 7 | `_imputation` | int | 10 | non |  | 1 |

## Valeurs distinctes

### `_ordre_affichage` (17 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 2, 3, 4, 5, 6, 7, 8, 9, 99
```

### `_type` (4 valeurs)

```
A, E, V, Z
```

### `_quand` (4 valeurs)

```
F, O, P, Z
```

### `_quoi` (6 valeurs)

```
ART, CAR, CHE, DEV, MON, OD
```

### `_libelle_fra` (10 valeurs)

```
EntrÃ©e cartes, EntrÃ©e chÃ¨ques, EntrÃ©e devises, EntrÃ©e monnaie locale, EntrÃ©e OD, EntrÃ©es devises, EntrÃ©es OD, Solde OD, Sortie monnaie locale, Sortie produit
```

### `_libelle_ang` (8 valeurs)

```
Balance OD, In card, In check, In currencies, In local currency, In OD, Out local currency, Out product
```

### `_imputation` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_eledetail_cloture_IDX_1 | NONCLUSTERED | oui | _ordre_affichage |

