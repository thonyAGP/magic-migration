# pv_lieux_vente

**Nom logique Magic** : `pv_lieux_vente`

| Info | Valeur |
|------|--------|
| Lignes | 16 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `LIE_Service` | nvarchar | 4 | non |  | 10 |
| 2 | `LIE_Code_lieu` | nvarchar | 6 | non |  | 15 |
| 3 | `LIE_Libelle_lieu` | nvarchar | 50 | non |  | 16 |
| 4 | `LIE_Lieu_actif` | nvarchar | 1 | non |  | 2 |
| 5 | `LIE_Id_Article_imputation` | float | 53 | non |  | 8 |

## Valeurs distinctes

### `LIE_Service` (10 valeurs)

```
BABY, BARD, BOUT, COMM, ESTH, EXCU, INFI, PHOT, REST, SPNA
```

### `LIE_Code_lieu` (15 valeurs)

```
BARD, BARFRO, CHUDA, EXC, FRONT, MAIN, MINICL, NURSE, PETITC, PHOTO, RECEP, SCUBA, SHOP, SPA, SPA1
```

### `LIE_Libelle_lieu` (16 valeurs)

```
BABY CLUB, BAR FRONT, BOUTIQUE, CHUDA, CHUDA REST., DIVE SHOP, EXCURSIONS, MAIN BAR, MAIN RESTO, NURSE, PETIT CLUB, PHOTO SHOP, RECEP, SHOP, SPA MANAGER, SPA1
```

### `LIE_Lieu_actif` (2 valeurs)

```
N, O
```

### `LIE_Id_Article_imputation` (8 valeurs)

```
0, 100, 2602, 2603, 38, 467670, 467675, 7
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_lieux_vente_IDX_1 | NONCLUSTERED | oui | LIE_Service, LIE_Code_lieu |

