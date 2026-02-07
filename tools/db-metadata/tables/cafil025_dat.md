# cafil025_dat

| Info | Valeur |
|------|--------|
| Lignes | 3814 |
| Colonnes | 14 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cgm_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `cgm_code_adherent` | int | 10 | non |  | 3814 |
| 3 | `cgm_qualite` | nvarchar | 2 | non |  | 3 |
| 4 | `cgm_nom_prenom` | nvarchar | 26 | non |  | 3798 |
| 5 | `cgm_etat` | nvarchar | 1 | non |  | 2 |
| 6 | `cgm_garanti` | nvarchar | 1 | non |  | 2 |
| 7 | `cgm_solde_du_compte` | float | 53 | non |  | 86 |
| 8 | `cgm_datetimelastcheckout` | float | 53 | non |  | 688 |
| 9 | `cgm_date_limit_solde` | char | 8 | non |  | 148 |
| 10 | `cgm_date_compt__sold` | char | 8 | non |  | 76 |
| 11 | `cgm_date_lastoperat_` | char | 8 | non |  | 110 |
| 12 | `cgm_heure_lastoperat` | char | 6 | non |  | 1938 |
| 13 | `cgm_operateur` | nvarchar | 8 | non |  | 11 |
| 14 | `cgm_flag` | nvarchar | 1 | non |  | 1 |

## Valeurs distinctes

### `cgm_societe` (1 valeurs)

```
C
```

### `cgm_qualite` (3 valeurs)

```
, GM, GO
```

### `cgm_etat` (2 valeurs)

```
, S
```

### `cgm_garanti` (2 valeurs)

```
, O
```

### `cgm_operateur` (11 valeurs)

```
, APICM, ARKON   , Arrivant, BEAM    , Creation, DSIOP, FAM, GIFT    , JAA     , MIND    
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil025_dat_IDX_5 | NONCLUSTERED | non | cgm_societe, cgm_date_limit_solde |
| cafil025_dat_IDX_4 | NONCLUSTERED | non | cgm_societe, cgm_qualite, cgm_nom_prenom |
| cafil025_dat_IDX_2 | NONCLUSTERED | non | cgm_societe, cgm_etat |
| cafil025_dat_IDX_3 | NONCLUSTERED | non | cgm_societe, cgm_nom_prenom |
| cafil025_dat_IDX_1 | NONCLUSTERED | oui | cgm_societe, cgm_code_adherent |

