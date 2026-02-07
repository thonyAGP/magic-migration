# comptestva

**Nom logique Magic** : `comptestva`

| Info | Valeur |
|------|--------|
| Lignes | 5 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cpt_compte` | float | 53 | non |  | 5 |
| 2 | `cpt_type` | nvarchar | 5 | non |  | 4 |
| 3 | `cpt_tva` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `cpt_compte` (5 valeurs)

```
4.6762e+008, 7.0641e+008, 7.0642e+008, 7.0831e+008
```

### `cpt_type` (4 valeurs)

```
FONDA, PARK, STAN, TRAF
```

### `cpt_tva` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| comptestva_IDX_2 | NONCLUSTERED | oui | cpt_type, cpt_compte |
| comptestva_IDX_1 | NONCLUSTERED | oui | cpt_compte |

