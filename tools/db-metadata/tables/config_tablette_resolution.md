# config_tablette_resolution

**Nom logique Magic** : `config_tablette_resolution`

| Info | Valeur |
|------|--------|
| Lignes | 9 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ctr_compturname` | nvarchar | 20 | non |  | 9 |
| 2 | `ctr_type_resolution` | int | 10 | non |  | 1 |
| 3 | `ctr_tablet` | bit |  | oui |  | 1 |

## Valeurs distinctes

### `ctr_compturname` (9 valeurs)

```
CMAWS8967768049, CMAWSGM0J6A9T, CMAWSGM0J6AA0, CMAWSGM0J6AA6, CMAWSGM0J6AAF, CMAWSGM0J6AAL, CMAWSPW0AJS0F, PHUCTB0008, PHUCTB0009
```

### `ctr_type_resolution` (1 valeurs)

```
0
```

### `ctr_tablet` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| ctr_config_tablette_IDX1 | NONCLUSTERED | oui | ctr_compturname |

