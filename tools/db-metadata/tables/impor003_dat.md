# impor003_dat

| Info | Valeur |
|------|--------|
| Lignes | 2805 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `iml_username` | nvarchar | 8 | non |  | 1 |
| 2 | `iml_num_ressource` | int | 10 | non |  | 2735 |
| 3 | `iml_date_debut` | char | 8 | non |  | 34 |
| 4 | `iml_date_fin` | char | 8 | non |  | 46 |
| 5 | `iml_u_p` | nvarchar | 1 | non |  | 1 |
| 6 | `iml_base_occupation` | nvarchar | 2 | oui |  | 6 |
| 7 | `iml_code_logement` | nvarchar | 6 | non |  | 14 |
| 8 | `iml_chambre` | nvarchar | 6 | non |  | 1 |
| 9 | `iml_matrimoniaux` | nvarchar | 1 | non |  | 1 |
| 10 | `iml_oldlgt` | nvarchar | 6 | non |  | 1 |

## Valeurs distinctes

### `iml_username` (1 valeurs)

```
PLANNING
```

### `iml_date_debut` (34 valeurs)

```
20251220, 20251222, 20251223, 20251224, 20251225, 20251226, 20251227, 20251228, 20251229, 20251230, 20251231, 20260101, 20260102, 20260103, 20260104, 20260105, 20260106, 20260107, 20260108, 20260109, 20260110, 20260111, 20260112, 20260113, 20260114, 20260115, 20260116, 20260117, 20260118, 20260119, 20260120, 20260121, 20260122, 20260125
```

### `iml_date_fin` (46 valeurs)

```
20251225, 20251226, 20251227, 20251228, 20251229, 20251230, 20251231, 20260101, 20260102, 20260103, 20260104, 20260105, 20260106, 20260107, 20260108, 20260109, 20260110, 20260111, 20260112, 20260113, 20260114, 20260115, 20260116, 20260117, 20260118, 20260119, 20260120, 20260121, 20260122, 20260123, 20260124, 20260125, 20260126, 20260127, 20260128, 20260129, 20260130, 20260131, 20260201, 20260202, 20260204, 20260205, 20260206, 20260209, 20260210, 20260219
```

### `iml_u_p` (1 valeurs)

```
U
```

### `iml_base_occupation` (6 valeurs)

```
 1,  2,  3,  4,  5,  6
```

### `iml_code_logement` (14 valeurs)

```
A2+A2, A2A, B2+B2A, B2A, B4, B4T, C2+C2A, C2A, C2A+, GO, H2, H4, S2+B2A, S2A
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| impor003_dat_IDX_2 | NONCLUSTERED | oui | iml_username, iml_num_ressource, iml_date_fin |
| impor003_dat_IDX_1 | NONCLUSTERED | oui | iml_username, iml_num_ressource, iml_date_debut |

