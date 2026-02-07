# roomfile

| Info | Valeur |
|------|--------|
| Lignes | 789 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `room_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `room_type_client` | nvarchar | 1 | non |  | 2 |
| 3 | `room_adherent` | float | 53 | non |  | 215 |
| 4 | `room_filiation_club` | int | 10 | non |  | 16 |
| 5 | `room_chambre` | nvarchar | 6 | non |  | 236 |
| 6 | `room_date_debut_sejour` | char | 8 | non |  | 27 |
| 7 | `room_date_fin_sejour` | char | 8 | non |  | 26 |

## Valeurs distinctes

### `room_societe` (1 valeurs)

```
C
```

### `room_type_client` (2 valeurs)

```
B, C
```

### `room_filiation_club` (16 valeurs)

```
0, 1, 10, 11, 12, 13, 15, 2, 22, 3, 4, 5, 6, 7, 8, 9
```

### `room_date_debut_sejour` (27 valeurs)

```
20250524, 20250721, 20250722, 20251216, 20251217, 20251218, 20251219, 20251220, 20251221, 20251222, 20251223, 20251224, 20251225, 20251226, 20251227, 20251228, 20251229, 20251230, 20251231, 20260101, 20260102, 20260103, 20260106, 20260107, 20260108, 20260110, 20260125
```

### `room_date_fin_sejour` (26 valeurs)

```
20251224, 20251225, 20251226, 20251227, 20251228, 20251229, 20251230, 20251231, 20260101, 20260102, 20260103, 20260104, 20260105, 20260106, 20260107, 20260108, 20260109, 20260110, 20260111, 20260112, 20260113, 20260114, 20260116, 20260120, 20260125, 20261231
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| roomfile_IDX_1 | NONCLUSTERED | oui | room_societe, room_type_client, room_adherent, room_filiation_club, room_date_debut_sejour |

