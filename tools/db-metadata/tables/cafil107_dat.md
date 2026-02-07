# cafil107_dat

| Info | Valeur |
|------|--------|
| Lignes | 69 |
| Colonnes | 13 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `code_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `lieu_de_sejour` | nvarchar | 1 | non |  | 1 |
| 3 | `numero_import` | int | 10 | non |  | 69 |
| 4 | `nombre_arrivants` | int | 10 | non |  | 61 |
| 5 | `nombre_ressources` | int | 10 | non |  | 62 |
| 6 | `octets_ide_dat` | int | 10 | non |  | 62 |
| 7 | `octets_fra_dat` | int | 10 | non |  | 62 |
| 8 | `date_ide_dat` | char | 8 | non |  | 62 |
| 9 | `date_fra_dat` | char | 8 | non |  | 62 |
| 10 | `date_import` | char | 8 | non |  | 63 |
| 11 | `import_complet` | nvarchar | 1 | non |  | 2 |
| 12 | `temps_traitement` | char | 6 | non |  | 59 |
| 13 | `commentaire` | nvarchar | 16 | non |  | 6 |

## Valeurs distinctes

### `code_societe` (1 valeurs)

```
C
```

### `lieu_de_sejour` (1 valeurs)

```
G
```

### `import_complet` (2 valeurs)

```
O, Z
```

### `commentaire` (6 valeurs)

```
Annule, Dilya, Mily, MILY, OK/CHARMINE, Phuket
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil107_dat_IDX_1 | NONCLUSTERED | oui | code_societe, lieu_de_sejour, numero_import |
| cafil107_dat_IDX_2 | NONCLUSTERED | oui | code_societe, lieu_de_sejour, numero_import |

