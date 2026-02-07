# entete_facture_tva

**Nom logique Magic** : `entete_facture_tva`

| Info | Valeur |
|------|--------|
| Lignes | 12 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `eft_num_facture` | float | 53 | non |  | 12 |
| 2 | `eft_nom` | nvarchar | 100 | non |  | 7 |
| 3 | `eft_adresse` | nvarchar | 100 | non |  | 7 |
| 4 | `eft_code_postal` | nvarchar | 10 | non |  | 6 |
| 5 | `eft_ville` | nvarchar | 50 | non |  | 5 |
| 6 | `eft_telephone` | nvarchar | 30 | non |  | 4 |
| 7 | `eft_pays` | nvarchar | 3 | non |  | 1 |
| 8 | `eft_pays_libelle` | nvarchar | 50 | non |  | 1 |
| 9 | `eft_mention_nom` | bit |  | non |  | 1 |
| 10 | `eft_mention_adresse` | bit |  | non |  | 1 |

## Valeurs distinctes

### `eft_num_facture` (12 valeurs)

```
1.803e+007, 1.806e+007, 1.812e+007, 1.908e+007, 1.912e+007
```

### `eft_nom` (7 valeurs)

```
  OUTSIDER AUGUST, Me Annie JULOU, Me Sophie MARTINEZ, Me Xiao Xuan TAN, Mr John Antho GIBBONS, Mr Vincent DU PREEZ, Mr Wan Jing ZHOU
```

### `eft_adresse` (7 valeurs)

```
15 RUE DU CERISIER, 195 R DU FAUBOURG SAINT HONORE, BONDEXCEL SOUTHRAND PTY LTD, clubmed, j, Phuket Village, SHARE
```

### `eft_code_postal` (6 valeurs)

```
, 000000, 1900, 30900, 75008, kata
```

### `eft_ville` (5 valeurs)

```
, NIMES, PARIS CEDEX, SHANGHAI, VANDERBIJLPARK
```

### `eft_telephone` (4 valeurs)

```
, 076330455, VAT #140219355, VAT #4140219355
```

### `eft_mention_nom` (1 valeurs)

```
1
```

### `eft_mention_adresse` (1 valeurs)

```
1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| entete_facture_tva_IDX_1 | NONCLUSTERED | oui | eft_num_facture |

