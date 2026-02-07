# pv_invoicehistoline

| Info | Valeur |
|------|--------|
| Lignes | 111903 |
| Colonnes | 12 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `hppl_histochrono` | int | 10 | non |  | 76232 |
| 2 | `hppl_chrono` | int | 10 | non |  | 65 |
| 3 | `hppl_payer_id` | float | 53 | non |  | 15325 |
| 4 | `hppl_xcust_id` | float | 53 | non |  | 25012 |
| 5 | `hppl_package_id_out` | float | 53 | non |  | 34698 |
| 6 | `hppl_package_id_in` | float | 53 | non |  | 4409 |
| 7 | `hppl_amount` | float | 53 | non |  | 3149 |
| 8 | `hppl_action` | nvarchar | 10 | non |  | 2 |
| 9 | `pv_service` | nvarchar | 4 | non |  | 11 |
| 10 | `hppl_free_extra` | bit |  | non |  | 2 |
| 11 | `hppl_montant_free_extra` | float | 53 | non |  | 710 |
| 12 | `hppll_ordre_edition` | float | 53 | non |  | 47 |

## Valeurs distinctes

### `hppl_action` (2 valeurs)

```
CANCEL, SALE
```

### `pv_service` (11 valeurs)

```
BABY, BARD, BOUT, COMM, ESTH, EXCU, INFI, PHOT, REST, SPNA, SPTE
```

### `hppl_free_extra` (2 valeurs)

```
0, 1
```

### `hppll_ordre_edition` (47 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 3, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 4, 40, 41, 42, 43, 44, 45, 46, 5, 6, 7, 8, 9
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_invoicehistoline_IDX_1 | NONCLUSTERED | oui | hppl_histochrono, hppl_chrono |

