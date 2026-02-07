# cafil076_dat

| Info | Valeur |
|------|--------|
| Lignes | 21 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pid_societe` | nvarchar | 1 | non |  | 5 |
| 2 | `pid_code_piece` | nvarchar | 1 | non |  | 5 |
| 3 | `pid_libelle` | nvarchar | 20 | non |  | 5 |
| 4 | `pid_code_modif` | nvarchar | 1 | non |  | 2 |

## Valeurs distinctes

### `pid_societe` (5 valeurs)

```
A, B, C, D, G
```

### `pid_code_piece` (5 valeurs)

```
C, D, F, I, P
```

### `pid_libelle` (5 valeurs)

```
Carte d'identitÃ©, CARTES DE CREDIT, Livret de famille, Passeport, Permis de conduire
```

### `pid_code_modif` (2 valeurs)

```
, O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil076_dat_IDX_1 | NONCLUSTERED | oui | pid_societe, pid_code_piece |

