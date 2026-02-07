# cafil026_dat

| Info | Valeur |
|------|--------|
| Lignes | 1135 |
| Colonnes | 11 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `sld_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `sld_operateur` | nvarchar | 8 | non |  | 13 |
| 3 | `sld_date_du_solde` | char | 8 | non |  | 131 |
| 4 | `sld_heure_du_solde` | char | 6 | non |  | 1001 |
| 5 | `sld_num_compte` | int | 10 | non |  | 884 |
| 6 | `sld_mode_de_paiement` | nvarchar | 4 | non |  | 9 |
| 7 | `sld_devise` | nvarchar | 3 | non |  | 7 |
| 8 | `sld_quantite` | float | 53 | non |  | 811 |
| 9 | `sld_taux_change` | float | 53 | non |  | 4 |
| 10 | `sld_montant` | float | 53 | non |  | 814 |
| 11 | `RowId_48` | int | 10 | non |  | 1135 |

## Valeurs distinctes

### `sld_societe` (1 valeurs)

```
C
```

### `sld_operateur` (13 valeurs)

```
ARKON   , AUNKO, BEAM, DOREEN  , ESTELLE, GIFT, ING, JAA, JOLIE, JULIA   , MICKY, MIND, WELCMGR
```

### `sld_mode_de_paiement` (9 valeurs)

```
, 1348, ALIP, AMEX, CASH, CCAU, VADA, VADV, VISA
```

### `sld_devise` (7 valeurs)

```
,  TH, AA, EUR, THB, USD, VA
```

### `sld_taux_change` (4 valeurs)

```
0, 1, 30.2529, 32.8476
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil026_dat_IDX_3 | NONCLUSTERED | oui | RowId_48 |
| cafil026_dat_IDX_1 | NONCLUSTERED | non | sld_operateur, sld_date_du_solde, sld_heure_du_solde, sld_societe, sld_num_compte |
| cafil026_dat_IDX_2 | NONCLUSTERED | non | sld_societe, sld_num_compte |

