# import_recup_numchambre

| Info | Valeur |
|------|--------|
| Lignes | 7128 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `rowid` | int | 10 | non |  | 7128 |
| 2 | `utilisateur` | nvarchar | 10 | non |  | 3 |
| 3 | `numero_adherent` | float | 53 | non |  | 1061 |
| 4 | `ordre_adherent` | smallint | 5 | non |  | 25 |
| 5 | `chambre` | nvarchar | 6 | non |  | 378 |
| 6 | `date_debut_hebergement` | varchar | 8 | non |  | 66 |
| 7 | `lieu_sejour` | nvarchar | 1 | non |  | 2 |
| 8 | `numero_import` | int | 10 | non |  | 33 |

## Valeurs distinctes

### `utilisateur` (3 valeurs)

```
PLANNING, SNOW, WELCMGR
```

### `ordre_adherent` (25 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 17, 2, 21, 22, 23, 24, 25, 26, 28, 29, 3, 4, 5, 6, 7, 8, 9
```

### `lieu_sejour` (2 valeurs)

```
, G
```

### `numero_import` (33 valeurs)

```
0, 1398, 1399, 1400, 1401, 1402, 1403, 1404, 1405, 1406, 1407, 1408, 1409, 1410, 1411, 1412, 1413, 1414, 1415, 1416, 1417, 1418, 1419, 1420, 1421, 1422, 1423, 1424, 1425, 1426, 1427, 1428, 1429
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| chambimport_dat_IDX_2 | NONCLUSTERED | oui | rowid |
| chambimport_dat_IDX_1 | NONCLUSTERED | non | utilisateur, numero_adherent, ordre_adherent |
| chambimport_dat_IDX_3 | NONCLUSTERED | non | lieu_sejour, numero_import, numero_adherent, ordre_adherent, date_debut_hebergement |

