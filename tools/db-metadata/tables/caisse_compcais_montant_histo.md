# caisse_compcais_montant_histo

| Info | Valeur |
|------|--------|
| Lignes | 3660 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `hism_user` | nvarchar | 8 | non |  | 32 |
| 2 | `hism_quand` | nvarchar | 1 | non |  | 2 |
| 3 | `hism_chrono_histo` | float | 53 | non |  | 293 |
| 4 | `hism_ordre` | int | 10 | non |  | 4 |
| 5 | `hism_chrono` | int | 10 | non |  | 12 |
| 6 | `hism_moyen_de_paiement` | nvarchar | 4 | non |  | 12 |
| 7 | `hism_montant` | float | 53 | non |  | 93 |
| 8 | `hism_chrono_session` | float | 53 | non |  | 84 |

## Valeurs distinctes

### `hism_user` (32 valeurs)

```
APPLE, ARKON, ASSTFAM, AUNKO, BATU, BEAM, DADA, DOREEN, DORI, ESTELLE, EVE, FAJAR, FAM, GIFT, ING, JAA, JAA1, JOLIE, JOY, JULIA, KIMMY, MICKY, MIMI, MIND, OAT, PEPSI, PLANNING, REMI, TEMMY, TIK, TOMOKA, WELCMGR
```

### `hism_quand` (2 valeurs)

```
F, O
```

### `hism_ordre` (4 valeurs)

```
10, 11, 17, 99
```

### `hism_chrono` (12 valeurs)

```
1, 10, 11, 12, 2, 3, 4, 5, 6, 7, 8, 9
```

### `hism_moyen_de_paiement` (12 valeurs)

```
ALIP, AMEX, BATR, CASH, CCAU, CHQ, OD, UNIO, VADA, VADV, VISA, WECH
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_compcais_montant_histo_IDX_1 | NONCLUSTERED | oui | hism_user, hism_chrono_histo, hism_ordre, hism_chrono, hism_moyen_de_paiement |

