# cafil108_dat

| Info | Valeur |
|------|--------|
| Lignes | 10 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `lan_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `lan_code_langue` | nvarchar | 1 | non |  | 10 |
| 3 | `lan_libelle_code` | nvarchar | 2 | non |  | 10 |
| 4 | `lan_libelle` | nvarchar | 20 | non |  | 10 |
| 5 | `lan_code_corresp_tel` | nvarchar | 1 | non |  | 4 |
| 6 | `lan_code_corresp_qua` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `lan_societe` (1 valeurs)

```
C
```

### `lan_code_langue` (10 valeurs)

```
, 1, 2, 3, 4, 5, 6, 7, 8, 9
```

### `lan_libelle_code` (10 valeurs)

```
, AL, CH, CO, FR, GB, IT, JP, NL, SP
```

### `lan_libelle` (10 valeurs)

```
ALLEMAND, ANGLAIS, CHINOIS, COREEN, ESPAGNOL, FRANCAIS, INCONNUE, ITALIEN, JAPONAIS, NEERLENDAIS
```

### `lan_code_corresp_tel` (4 valeurs)

```
1, 2, 3, 4
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil108_dat_IDX_2 | NONCLUSTERED | non | lan_societe, lan_libelle |
| cafil108_dat_IDX_1 | NONCLUSTERED | oui | lan_societe, lan_code_langue |

