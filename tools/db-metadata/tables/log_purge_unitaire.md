# log_purge_unitaire

**Nom logique Magic** : `log_purge_unitaire`

| Info | Valeur |
|------|--------|
| Lignes | 13 |
| Colonnes | 12 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `lpu_nom_adherent` | nvarchar | 30 | non |  | 5 |
| 2 | `lpu_prenom_adherent` | nvarchar | 20 | non |  | 12 |
| 3 | `lpu_num_ressource` | nvarchar | 5 | non |  | 13 |
| 4 | `lpu_num_adherent` | bigint | 19 | non |  | 3 |
| 5 | `lpu_filiation_adh` | smallint | 5 | non |  | 8 |
| 6 | `lpu_statut` | nvarchar | 1 | non |  | 1 |
| 7 | `lpu_num_compte` | int | 10 | non |  | 1 |
| 8 | `lpu_filiation_compte` | smallint | 5 | non |  | 1 |
| 9 | `lpu_date_debut` | char | 8 | non |  | 3 |
| 10 | `lpu_date_fin` | char | 8 | non |  | 3 |
| 11 | `lpu_num_dossier` | bigint | 19 | non |  | 3 |
| 12 | `lpu_message` | nvarchar | 100 | non |  | 3 |

## Valeurs distinctes

### `lpu_nom_adherent` (5 valeurs)

```
ARIBI, ESTEVE, KRASNOV, KRASNOVA, MONTMITONNET
```

### `lpu_prenom_adherent` (12 valeurs)

```
ANNIE, ILIA, INAYA, KAESYN, KIRILL, LIYAH, MARIIA, MICHEL, NESLLY, NIDAL, NIYAL, PETR
```

### `lpu_num_ressource` (13 valeurs)

```
 395,  396,  647,  648,  649,  650, 1159, 1160, 1161, 1162, 1163, 1164, 1165
```

### `lpu_num_adherent` (3 valeurs)

```
19009927, 20826428, 23508357
```

### `lpu_filiation_adh` (8 valeurs)

```
0, 1, 2, 3, 4, 5, 6, 9
```

### `lpu_statut` (1 valeurs)

```
N
```

### `lpu_num_compte` (1 valeurs)

```
0
```

### `lpu_filiation_compte` (1 valeurs)

```
0
```

### `lpu_date_debut` (3 valeurs)

```
20251212, 20251231, 20260104
```

### `lpu_date_fin` (3 valeurs)

```
20251231, 20260101, 20260111
```

### `lpu_num_dossier` (3 valeurs)

```
146179109, 201327110, 347249067
```

### `lpu_message` (3 valeurs)

```
The new stay will only be imported from 01/01/2026, The new stay will only be imported from 02/01/2026, The new stay will only be imported from 12/01/2026
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| log_purge_unitaire_IDX_1 | NONCLUSTERED | oui | lpu_num_ressource, lpu_num_adherent, lpu_filiation_adh |

