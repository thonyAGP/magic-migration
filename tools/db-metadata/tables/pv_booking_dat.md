# pv_booking_dat

**Nom logique Magic** : `pv_booking_dat`

| Info | Valeur |
|------|--------|
| Lignes | 654 |
| Colonnes | 13 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cust_id` | float | 53 | non |  | 279 |
| 2 | `package_id` | float | 53 | non |  | 649 |
| 3 | `booking_id` | nvarchar | 30 | oui |  | 523 |
| 4 | `date_create` | char | 8 | non |  | 53 |
| 5 | `time_create` | char | 6 | non |  | 406 |
| 6 | `user_create` | nvarchar | 10 | non |  | 5 |
| 7 | `date_update` | char | 8 | non |  | 2 |
| 8 | `time_update` | char | 6 | non |  | 1 |
| 9 | `user_update` | nvarchar | 10 | non |  | 1 |
| 10 | `pv_service` | nvarchar | 4 | non |  | 1 |
| 11 | `status` | nvarchar | 10 | non |  | 1 |
| 12 | `id_order` | int | 10 | non |  | 523 |
| 13 | `description` | nvarchar | 50 | non |  | 10 |

## Valeurs distinctes

### `user_create` (5 valeurs)

```
BARMGR, SCUBA, SPA1, SPA2, SPAMGR
```

### `date_update` (2 valeurs)

```
00000000, 19010101
```

### `time_update` (1 valeurs)

```
000000
```

### `pv_service` (1 valeurs)

```
ESTH
```

### `description` (10 valeurs)

```
, Brightening Therapy, Custom Massage 50', Discovery Facial 30', Hydrating Therapy 80, Scrub 30', Signature Therapy 80, Symphony of Senses 8, Thai Massage 50', Thai Massage 80'
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_booking_dat_IDX_1 | NONCLUSTERED | oui | pv_service, cust_id, package_id, booking_id |

