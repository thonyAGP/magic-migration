# wording_mention_legal

**Nom logique Magic** : `wording_mention_legal`

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `nom` | nvarchar | 50 | non |  | 1 |
| 3 | `adresse` | nvarchar | 200 | non |  | 1 |
| 4 | `telephone` | nvarchar | 20 | non |  | 1 |
| 5 | `fax` | nvarchar | 20 | non |  | 1 |
| 6 | `adresse_internet` | nvarchar | 50 | non |  | 1 |
| 7 | `va_intracomm` | nvarchar | 50 | non |  | 1 |
| 8 | `libelle_1` | nvarchar | 250 | non |  | 1 |
| 9 | `libelle_2` | nvarchar | 250 | non |  | 1 |
| 10 | `libelle_3` | nvarchar | 250 | non |  | 1 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `nom` (1 valeurs)

```
CLUB MEDITERRANEE SA (Club Med Â®)
```

### `adresse` (1 valeurs)

```
11, rue de Cambrai 75957 Paris Cedex 19 - France
```

### `telephone` (1 valeurs)

```
+33.1.53.35.35.53
```

### `fax` (1 valeurs)

```
+33.1.53.35.36.16
```

### `adresse_internet` (1 valeurs)

```
www.clubmed.com
```

### `va_intracomm` (1 valeurs)

```
NÂ° TVA Intracomm : FR56 572185684
```

### `libelle_1` (1 valeurs)

```
SociÃ©tÃ© Anonyme au capital de 149 051 194 â‚¬ - 572 185 684 RCS Paris - Licence IM075100307
```

### `libelle_2` (1 valeurs)

```
RCP nÂ° AA.992.497 GENRALI ASSURANCES IARD 7 Boulevard Haussman - F- 75456 Paris Cedex 9
```

### `libelle_3` (1 valeurs)

```
Garantie FinanÃ§iÃ¨re APS, 15 avenue Carnot - F - 75017 Paris
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| w_mention_legal_IDX_1 | NONCLUSTERED | oui | societe |

