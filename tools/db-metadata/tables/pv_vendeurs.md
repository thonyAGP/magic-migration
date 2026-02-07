# pv_vendeurs

**Nom logique Magic** : `pv_vendeurs`

| Info | Valeur |
|------|--------|
| Lignes | 124 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `PVD_Service` | nvarchar | 4 | non |  | 13 |
| 2 | `PVD_Code_vendeur` | nvarchar | 8 | non |  | 109 |
| 3 | `PVD_Nom_vendeur` | nvarchar | 50 | non |  | 117 |
| 4 | `PVD_Vendeur_actif` | nvarchar | 1 | non |  | 2 |
| 5 | `PVD_Id_vendeur` | nvarchar | 6 | non |  | 93 |

## Valeurs distinctes

### `PVD_Service` (13 valeurs)

```
BABY, BARD, BOUT, COMM, ESTH, EXCU, GEST, INFI, MINI, PHOT, REST, SPNA, SPTE
```

### `PVD_Vendeur_actif` (2 valeurs)

```
N, O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_vendeurs_IDX_1 | NONCLUSTERED | oui | PVD_Service, PVD_Code_vendeur |

