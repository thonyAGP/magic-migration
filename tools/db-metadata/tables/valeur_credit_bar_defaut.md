# valeur_credit_bar_defaut

**Nom logique Magic** : `valeur_credit_bar_defaut`

| Info | Valeur |
|------|--------|
| Lignes | 8 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `vcb_qualite_type` | nvarchar | 1 | non |  | 2 |
| 2 | `vcb_valeur` | nvarchar | 4 | non |  | 8 |
| 3 | `vcb_montant` | float | 53 | non |  | 3 |

## Valeurs distinctes

### `vcb_qualite_type` (2 valeurs)

```
C, Q
```

### `vcb_valeur` (8 valeurs)

```
1, 2, 3, FORM, MISS, SEM, STAG, VILL
```

### `vcb_montant` (3 valeurs)

```
0, 185, 92.5
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| valeur_credit_bar_defaut_IDX_1 | NONCLUSTERED | oui | vcb_qualite_type, vcb_valeur |

