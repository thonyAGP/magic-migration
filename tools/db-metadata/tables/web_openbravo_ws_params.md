# web_openbravo_ws_params

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `wop_identification` | nvarchar | 3 | non |  | 1 |
| 2 | `wop_username` | nvarchar | 200 | oui |  | 1 |
| 3 | `wop_password` | nvarchar | 200 | oui |  | 1 |
| 4 | `wop_email_alert` | nvarchar | 500 | oui |  | 0 |
| 5 | `wop_url_api` | nvarchar | 2000 | non |  | 1 |
| 6 | `wop_proxy_adress` | nvarchar | 2000 | non |  | 1 |
| 7 | `wop_mono_store_code` | char | 12 | non |  | 1 |

## Valeurs distinctes

### `wop_identification` (1 valeurs)

```
116
```

### `wop_username` (1 valeurs)

```
JH
```

### `wop_password` (1 valeurs)

```
04fhjl2012
```

### `wop_url_api` (1 valeurs)

```
https://club-med.cloud.openbravo.com/openbravo/org.openbravo.service.json.jsonrest
```

### `wop_proxy_adress` (1 valeurs)

```
http://eafproxyprod:8080/
```

### `wop_mono_store_code` (1 valeurs)

```
            
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| web_openbravo_ws_params_IDX_1 | NONCLUSTERED | oui | wop_identification |

