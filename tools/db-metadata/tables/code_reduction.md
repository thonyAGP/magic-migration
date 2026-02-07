# code_reduction

**Nom logique Magic** : `code_reduction`

| Info | Valeur |
|------|--------|
| Lignes | 69 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cred_code` | nvarchar | 15 | non |  | 35 |
| 2 | `cred_libelle` | nvarchar | 30 | non |  | 44 |
| 3 | `cred_pourcentage` | int | 10 | non |  | 10 |
| 4 | `cred_variable` | bit |  | non |  | 2 |
| 5 | `cred_actif` | bit |  | non |  | 2 |
| 6 | `cred_langue` | nvarchar | 3 | oui |  | 2 |

## Valeurs distinctes

### `cred_code` (35 valeurs)

```
100%, 100% CDV, 100% SUPPLIER, 15% EXTEND, 15% VSL OFFER, 20% EXTENSION, 20% FLASH SALE, 25 DISCOUNT, 25% EXTEND, 25% UPDISC, 25% W25, 30% CDV GEST CO, 30% EBB, 30% EXTEND, 30% FAMGO, 454, 50% CDV, 50% CDV GEST CO, 50% FAM RDS, CHEVI, EXCEP 10%, EXTEND, FAMGO, FAMRDS, FLASH SALE, FREE CDV, FREE UP CDV, FREECV, FREEUP, GOLDUP, KLOOK, PROLON, REDNA, TARIF CONTRACT., TARIF SPECIAL
```

### `cred_libelle` (44 valeurs)

```
100%, 15% EXTEND, 25 DISCOUNT, 25% EXTENSION, 25% W25, 30% CDV GESTE COMMERCIAL, 30% EBB, 30% EXTEND, 30% EXTENSION, 50% CDV GESTE COMMERCIAL, 56, CDV 100% OFFER, CDV 50% OFFER, Chef de village, CHIEF OF THE VILLAGE, CONTRACTUAL PRICE TABLE, DSDSDSDFD, EXCEP 10%, EXTEND, EXTENSION, FAMILLE RDS, FAMILLY RDS, FLASH EXTENSION 20%, FLASH SALE, FLASH SALE 20%, FREE UP CDV, FREE UPGRADE, GO FAMILIESâ€™ GUESTS 30%, GOLDUP, GUEST CHIEF OF THE VILLAGE, GUEST GO, INVITE CDV, INVITE GO, KLOOK, PROLONGATION, RDS 50% OFFER, REDNA, SPECIAL PRICE TABLE, SUPPLIER 100%, SURCLASS GRATUIT, TARIF CONTRACTUEL, TARIF SPECIAL, Upgrade 25%, VSL OFFER 15%
```

### `cred_pourcentage` (10 valeurs)

```
0, 10, 100, 11, 15, 20, 25, 30, 50, 55
```

### `cred_variable` (2 valeurs)

```
0, 1
```

### `cred_actif` (2 valeurs)

```
0, 1
```

### `cred_langue` (2 valeurs)

```
ANG, FRA
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| code_reduction_IDX_1 | NONCLUSTERED | oui | cred_code, cred_langue |

