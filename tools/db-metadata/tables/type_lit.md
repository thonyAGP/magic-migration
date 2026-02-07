# type_lit

**Nom logique Magic** : `type_lit`

| Info | Valeur |
|------|--------|
| Lignes | 10 |
| Colonnes | 11 |
| Clef primaire | tyl_code |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tyl_code` | nvarchar | 10 | non | PK | 10 |
| 2 | `tyl_libelle` | nvarchar | 30 | non |  | 10 |
| 3 | `tyl_largeur_min` | smallint | 5 | non |  | 5 |
| 4 | `tyl_largeur_max` | smallint | 5 | non |  | 5 |
| 5 | `tyl_longueur_min` | smallint | 5 | non |  | 2 |
| 6 | `tyl_longueur_max` | smallint | 5 | non |  | 2 |
| 7 | `tyl_age` | bit |  | non |  | 2 |
| 8 | `tyl_zippable` | bit |  | non |  | 2 |
| 9 | `tyl_largeur_vill` | smallint | 5 | non |  | 1 |
| 10 | `tyl_longueur_vill` | smallint | 5 | non |  | 1 |
| 11 | `tyl_age_defaut` | smallint | 5 | non |  | 1 |

## Valeurs distinctes

### `tyl_code` (10 valeurs)

```
BINK, DAY, DRAW, FULL, FUTON, KING, QUEEN, ROLL, SOFA, TWIN
```

### `tyl_libelle` (10 valeurs)

```
Bunk bed/Lit superposÃ©, Daybed/Banquette, Drawer bed/Lit gigogne, Full size bed/Lit double, Futon, King size, Queen size, Rolloway bed/Lit pliant, Sofa bed/Convertible, Twin bed/lit simple
```

### `tyl_largeur_min` (5 valeurs)

```
0, 140, 150, 180, 70
```

### `tyl_largeur_max` (5 valeurs)

```
0, 139, 149, 179, 280
```

### `tyl_longueur_min` (2 valeurs)

```
0, 200
```

### `tyl_longueur_max` (2 valeurs)

```
0, 200
```

### `tyl_age` (2 valeurs)

```
0, 1
```

### `tyl_zippable` (2 valeurs)

```
0, 1
```

### `tyl_largeur_vill` (1 valeurs)

```
0
```

### `tyl_longueur_vill` (1 valeurs)

```
0
```

### `tyl_age_defaut` (1 valeurs)

```
0
```

