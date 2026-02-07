# version

**Nom logique Magic** : `version`

| Info | Valeur |
|------|--------|
| Lignes | 143 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `VER_Application` | nvarchar | 3 | non |  | 115 |
| 2 | `VER_Version` | nvarchar | 30 | non |  | 4 |
| 3 | `VER_Activation` | bit |  | non |  | 2 |
| 4 | `VER_Libelle` | nvarchar | 50 | non |  | 143 |
| 5 | `VER_Commentaire` | nvarchar | 500 | non |  | 105 |
| 6 | `VER_Modifiable` | bit |  | non |  | 2 |
| 7 | `VER_Date_creation` | datetime |  | oui |  | 89 |

## Valeurs distinctes

### `VER_Version` (4 valeurs)

```
1.00, 2.00, 3.00, 4.00
```

### `VER_Activation` (2 valeurs)

```
0, 1
```

### `VER_Modifiable` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| version_IDX_1 | NONCLUSTERED | oui | VER_Application, VER_Version |

