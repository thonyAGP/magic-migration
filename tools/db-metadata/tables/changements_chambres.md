# changements_chambres

**Nom logique Magic** : `changements_chambres`

| Info | Valeur |
|------|--------|
| Lignes | 32652 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chl_categorie_logement` | nvarchar | 6 | non |  | 26 |
| 2 | `chl_date` | char | 8 | non |  | 1753 |
| 3 | `chl_num_compte` | int | 10 | non |  | 19612 |
| 4 | `chl_nom_logement_avant` | nvarchar | 6 | non |  | 692 |
| 5 | `chl_nom_logement_desti` | nvarchar | 6 | non |  | 709 |
| 6 | `chl_pyr_status` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `chl_categorie_logement` (26 valeurs)

```
 , A2, A2+, A2+A2, A2A, B2, B2+B2, B2+B2A, B2A, B4, B4T, C2, C2+, C2+C2, C2+C2A, C2A, C2A+, G2, GO, H2, H4, S2, S2+A2, S2+B2, S2+B2A, S2A
```

### `chl_pyr_status` (1 valeurs)

```
 
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| changements_chambres_IDX_1 | NONCLUSTERED | oui | chl_categorie_logement, chl_date, chl_num_compte, chl_nom_logement_avant |

