# caisse_histo_aju_solde

| Info | Valeur |
|------|--------|
| Lignes | 13 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono` | int | 10 | non |  | 13 |
| 2 | `type_ajustement` | nvarchar | 1 | non |  | 1 |
| 3 | `date_ajustement` | char | 8 | non |  | 13 |
| 4 | `heure_ajustement` | char | 6 | non |  | 13 |
| 5 | `qui` | nvarchar | 8 | non |  | 1 |
| 6 | `solde_avant` | float | 53 | non |  | 13 |
| 7 | `montant_ajustement` | float | 53 | non |  | 11 |
| 8 | `numero_pdc` | int | 10 | non |  | 13 |
| 9 | `date_comptable` | char | 8 | non |  | 13 |

## Valeurs distinctes

### `chrono` (13 valeurs)

```
1, 10, 11, 12, 13, 2, 3, 4, 5, 6, 7, 8, 9
```

### `type_ajustement` (1 valeurs)

```
C
```

### `date_ajustement` (13 valeurs)

```
20220416, 20220601, 20240828, 20240831, 20240918, 20241121, 20250115, 20250331, 20250628, 20250727, 20251101, 20251104, 20251105
```

### `heure_ajustement` (13 valeurs)

```
001322, 003253, 011115, 011644, 020601, 031435, 033407, 033727, 041206, 044223, 051034, 054624, 054629
```

### `qui` (1 valeurs)

```
FAM
```

### `solde_avant` (13 valeurs)

```
106892, 185066, 224189, 245193, 252564, 261228, 292814, 483364, 509804, 729737, 740448, 81814.6, 871903
```

### `montant_ajustement` (11 valeurs)

```
-127360, -1600, -18840, -2002, -234641, 252000, 3938.92, 5800, -7200, 792, -9136
```

### `numero_pdc` (13 valeurs)

```
1034, 1570, 16309, 16375, 16704, 18046, 19305, 21345, 23762, 24599, 27505, 27597, 27649
```

### `date_comptable` (13 valeurs)

```
20220415, 20220531, 20240828, 20240831, 20240918, 20241121, 20250115, 20250331, 20250628, 20250727, 20251031, 20251103, 20251105
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_histo_aju_solde_IDX_1 | NONCLUSTERED | oui | chrono |
| caisse_histo_aju_solde_IDX_2 | NONCLUSTERED | non | date_comptable |

