# type_article

**Nom logique Magic** : `type_article`

| Info | Valeur |
|------|--------|
| Lignes | 6 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tar_type` | nvarchar | 6 | non |  | 5 |
| 2 | `tar_libelle` | nvarchar | 100 | non |  | 5 |
| 3 | `tar_imputation` | float | 53 | non |  | 6 |
| 4 | `tar_stype` | nvarchar | 3 | non |  | 2 |
| 5 | `tar_stype_libelle` | nvarchar | 100 | non |  | 2 |
| 6 | `tar_budget` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `tar_type` (5 valeurs)

```
INS, TRF, VAE, VRL, VSL
```

### `tar_libelle` (5 valeurs)

```
Assurance Ski, Biking/Location de vÃ©los Ã  assitance Ã©lectrique, Transfert, Vente Repas Local, Vente SÃ©jour Local
```

### `tar_imputation` (6 valeurs)

```
0, 5.11311e+008, 7.06415e+008, 7.0641e+008, 7.0889e+008
```

### `tar_stype` (2 valeurs)

```
, LCO
```

### `tar_stype_libelle` (2 valeurs)

```
, Late Check Out
```

### `tar_budget` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| type_article_IDX_1 | NONCLUSTERED | oui | tar_type, tar_stype |

