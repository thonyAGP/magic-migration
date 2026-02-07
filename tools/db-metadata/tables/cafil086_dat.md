# cafil086_dat

| Info | Valeur |
|------|--------|
| Lignes | 23 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `clo_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `clo_code_lieu_sejour` | nvarchar | 1 | non |  | 1 |
| 3 | `clo_code_logement` | nvarchar | 6 | non |  | 23 |
| 4 | `clo_libelle` | nvarchar | 80 | oui |  | 22 |
| 5 | `clo_elligible_affec_auto` | nvarchar | 1 | non |  | 1 |
| 6 | `clo_prix_catalogue` | float | 53 | non |  | 1 |
| 7 | `clo_categ_chambre` | smallint | 5 | non |  | 1 |
| 8 | `clo_type_hebergement` | smallint | 5 | non |  | 1 |

## Valeurs distinctes

### `clo_societe` (1 valeurs)

```
C
```

### `clo_code_lieu_sejour` (1 valeurs)

```
G
```

### `clo_code_logement` (23 valeurs)

```
A2+A2, A2A, B2, B2+B2, B2+B2A, B2A, B4, B4T, C2, C2+, C2+C2, C2+C2A, C2A, C2A+, G1, G2, GO, H2, H4, S2, S2+B2, S2+B2A, S2A
```

### `clo_libelle` (22 valeurs)

```
Deluxe Room - Renovated, Family Superior room - Mobility accessible, Family Superior room - Oasis, Family Superior Theme room - Oasis, GO Room, Interconnecting Deluxe rooms, Interconnecting Superior Room - Renovated, Interconnecting Superior Room - Terrace or Balcony, Interconnecting Superior Room - Terrace or Balcony Renovated, Interconnecting Superior Rooms, Non Designe, Suite - Balcony, Suite - Balcony Interconnecting with Superior room - Terrace or Balcony, Suite - renovated, Suite interconnecting with superior room balcony/terrace - renovated, Superior Plus Room, Superior Plus Room - Renovated, Superior Room, Superior Room - Mobility Accessible, Superior Room - Renovated, Superior Room - Terrace or Balcony, Superior Room - Terrace or Balcony Renovated
```

### `clo_elligible_affec_auto` (1 valeurs)

```
O
```

### `clo_prix_catalogue` (1 valeurs)

```
0
```

### `clo_categ_chambre` (1 valeurs)

```
0
```

### `clo_type_hebergement` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil086_dat_IDX_1 | NONCLUSTERED | oui | clo_societe, clo_code_lieu_sejour, clo_code_logement |

