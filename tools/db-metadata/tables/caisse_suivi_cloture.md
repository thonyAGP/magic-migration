# caisse_suivi_cloture

| Info | Valeur |
|------|--------|
| Lignes | 1379 |
| Colonnes | 11 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `date_comptable` | char | 8 | non |  | 1379 |
| 3 | `saisie_tpe_fait` | bit |  | non |  | 2 |
| 4 | `saisie_tpe_date` | char | 8 | non |  | 1123 |
| 5 | `saisie_tpe_time` | char | 6 | non |  | 1274 |
| 6 | `generation_pdc_auto_fait` | bit |  | non |  | 1 |
| 7 | `generation_pdc_auto_date` | char | 8 | non |  | 1 |
| 8 | `generation_pdc_auto_time` | char | 6 | non |  | 1 |
| 9 | `controle_caisse_fait` | bit |  | non |  | 2 |
| 10 | `controle_caisse_date` | char | 8 | non |  | 287 |
| 11 | `controle_caisse_time` | char | 6 | non |  | 286 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `saisie_tpe_fait` (2 valeurs)

```
0, 1
```

### `generation_pdc_auto_fait` (1 valeurs)

```
0
```

### `generation_pdc_auto_date` (1 valeurs)

```
00000000
```

### `generation_pdc_auto_time` (1 valeurs)

```
000000
```

### `controle_caisse_fait` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_suivi_cloture_IDX_1 | NONCLUSTERED | oui | societe, date_comptable |

