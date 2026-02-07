# pv_serv_lieu_vendeur

**Nom logique Magic** : `pv_serv_lieu_vendeur`

| Info | Valeur |
|------|--------|
| Lignes | 12 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `SLV_Service` | nvarchar | 4 | non |  | 12 |
| 2 | `SLV_Flag_vendeur` | bit |  | non |  | 2 |
| 3 | `SLV_Flag_lieu` | bit |  | non |  | 2 |

## Valeurs distinctes

### `SLV_Service` (12 valeurs)

```
BABY, BARD, BOUT, COMM, ESTH, EXCU, GEST, INFI, MINI, PHOT, REST, SPNA
```

### `SLV_Flag_vendeur` (2 valeurs)

```
0, 1
```

### `SLV_Flag_lieu` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_serv_lieu_vendeur_IDX_1 | NONCLUSTERED | oui | SLV_Service |

