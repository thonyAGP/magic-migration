# cafil119_dat

| Info | Valeur |
|------|--------|
| Lignes | 5 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `dev_societe` | nvarchar | 1 | non |  | 5 |
| 2 | `dev_code_en_cours_ac` | nvarchar | 1 | non |  | 1 |
| 3 | `dev_code_en_cours_ve` | nvarchar | 1 | non |  | 1 |
| 4 | `dev_code_devise` | nvarchar | 3 | non |  | 1 |
| 5 | `dev_numero` | int | 10 | non |  | 1 |
| 6 | `dev_type_de_taux` | int | 10 | non |  | 1 |
| 7 | `dev_taux_banque_acha` | float | 53 | non |  | 1 |
| 8 | `dev_taux_banque_vent` | float | 53 | non |  | 1 |
| 9 | `dev_libelle` | nvarchar | 20 | non |  | 1 |

## Valeurs distinctes

### `dev_societe` (5 valeurs)

```
A, B, C, D, G
```

### `dev_code_en_cours_ac` (1 valeurs)

```
O
```

### `dev_code_en_cours_ve` (1 valeurs)

```
O
```

### `dev_code_devise` (1 valeurs)

```
THB
```

### `dev_numero` (1 valeurs)

```
0
```

### `dev_type_de_taux` (1 valeurs)

```
0
```

### `dev_taux_banque_acha` (1 valeurs)

```
1
```

### `dev_taux_banque_vent` (1 valeurs)

```
1
```

### `dev_libelle` (1 valeurs)

```
Thailande
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil119_dat_IDX_4 | NONCLUSTERED | oui | dev_societe, dev_type_de_taux, dev_numero |
| cafil119_dat_IDX_3 | NONCLUSTERED | oui | dev_societe, dev_code_devise, dev_type_de_taux |
| cafil119_dat_IDX_1 | NONCLUSTERED | oui | dev_societe, dev_code_en_cours_ac, dev_numero, dev_type_de_taux |
| cafil119_dat_IDX_2 | NONCLUSTERED | oui | dev_societe, dev_code_en_cours_ve, dev_numero, dev_type_de_taux |

