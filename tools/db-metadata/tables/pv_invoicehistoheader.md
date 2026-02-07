# pv_invoicehistoheader

| Info | Valeur |
|------|--------|
| Lignes | 76232 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `hpph_chrono` | int | 10 | non |  | 76232 |
| 2 | `hpph_payer` | float | 53 | non |  | 15325 |
| 3 | `hpph_date` | char | 8 | non |  | 1386 |
| 4 | `hpph_time` | char | 6 | non |  | 39802 |
| 5 | `hpph_printed` | bit |  | non |  | 1 |
| 6 | `pv_service` | nvarchar | 4 | non |  | 11 |
| 7 | `hpph_vente_en_mobilite` | bit |  | non |  | 2 |
| 8 | `hpph_receipt_file` | varbinary | MAX | non |  | 1914 |
| 9 | `hpph_receipt_file_name` | varchar | 100 | non |  | 1914 |
| 10 | `hpph_invoice_file` | varbinary | MAX | oui |  | 0 |

## Valeurs distinctes

### `hpph_printed` (1 valeurs)

```
1
```

### `pv_service` (11 valeurs)

```
BABY, BARD, BOUT, COMM, ESTH, EXCU, INFI, PHOT, REST, SPNA, SPTE
```

### `hpph_vente_en_mobilite` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_invoicehistoheader_IDX_2 | NONCLUSTERED | non | hpph_payer |
| pv_invoicehistoheader_IDX_1 | NONCLUSTERED | oui | hpph_chrono |

