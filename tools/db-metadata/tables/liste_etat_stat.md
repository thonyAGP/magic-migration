# liste_etat_stat

**Nom logique Magic** : `liste_etat_stat`

| Info | Valeur |
|------|--------|
| Lignes | 6 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `les_langue` | nvarchar | 3 | non |  | 2 |
| 2 | `les_code_etat` | nvarchar | 6 | non |  | 3 |
| 3 | `les_nom_etat` | nvarchar | 100 | non |  | 6 |
| 4 | `les_a_produire` | bit |  | non |  | 2 |

## Valeurs distinctes

### `les_langue` (2 valeurs)

```
ANG, FRA
```

### `les_code_etat` (3 valeurs)

```
STAARR, STADEP, STAPRE
```

### `les_nom_etat` (6 valeurs)

```
Record of daily arrivals by nationality, Record of daily departures by nationality, Record of daily presents by nationality, RelevÃ© des arrivÃ©es par jour et par nationalitÃ©, RelevÃ© des dÃ©parts par jour et par nationalitÃ©, RelevÃ© des prÃ©sents par jour et par nationalitÃ©
```

### `les_a_produire` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| liste_etat_stat_IDX_1 | NONCLUSTERED | oui | les_langue, les_code_etat |

