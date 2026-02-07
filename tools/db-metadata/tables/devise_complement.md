# devise_complement

**Nom logique Magic** : `devise_complement`

| Info | Valeur |
|------|--------|
| Lignes | 5 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `dvc_societe` | nvarchar | 1 | non |  | 5 |
| 2 | `dvc_devise` | nvarchar | 3 | non |  | 1 |
| 3 | `dvc_type_de_taux` | int | 10 | non |  | 1 |
| 4 | `dvc_code_en_cours_ac` | nvarchar | 1 | non |  | 1 |
| 5 | `dvc_code_en_cours_ve` | nvarchar | 1 | non |  | 1 |
| 6 | `dvc_taux_banque_achat` | float | 53 | non |  | 1 |
| 7 | `dvc_taux_banque_vente` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `dvc_societe` (5 valeurs)

```
A, B, C, D, G
```

### `dvc_devise` (1 valeurs)

```
THB
```

### `dvc_type_de_taux` (1 valeurs)

```
0
```

### `dvc_code_en_cours_ac` (1 valeurs)

```
O
```

### `dvc_code_en_cours_ve` (1 valeurs)

```
O
```

### `dvc_taux_banque_achat` (1 valeurs)

```
1
```

### `dvc_taux_banque_vente` (1 valeurs)

```
1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| devise_complement_IDX_1 | NONCLUSTERED | oui | dvc_societe, dvc_devise, dvc_type_de_taux |

