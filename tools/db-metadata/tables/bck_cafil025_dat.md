# bck_cafil025_dat

| Info | Valeur |
|------|--------|
| Lignes | 29852 |
| Colonnes | 15 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `cgb_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `cgb_code_adherent` | int | 10 | non |  | 4207 |
| 3 | `cgb_qualite` | nvarchar | 2 | non |  | 3 |
| 4 | `cgb_nom_prenom` | nvarchar | 26 | non |  | 3807 |
| 5 | `cgb_etat` | nvarchar | 1 | non |  | 3 |
| 6 | `cgb_garanti` | nvarchar | 1 | non |  | 2 |
| 7 | `cgb_solde_du_compte` | float | 53 | non |  | 281 |
| 8 | `cgb_plafond_depense` | float | 53 | non |  | 690 |
| 9 | `cgb_date_limit_solde` | char | 8 | non |  | 148 |
| 10 | `cgb_date_compt__sold` | char | 8 | non |  | 76 |
| 11 | `cgb_date_lastoperat_` | char | 8 | non |  | 110 |
| 12 | `cgb_heure_lastoperat` | char | 6 | non |  | 2122 |
| 13 | `cgb_operateur` | nvarchar | 8 | non |  | 10 |
| 14 | `cgb_flag` | nvarchar | 1 | non |  | 1 |
| 15 | `cgb_date_comptable` | char | 8 | non |  | 8 |

## Valeurs distinctes

### `cgb_societe` (1 valeurs)

```
C
```

### `cgb_qualite` (3 valeurs)

```
, GM, GO
```

### `cgb_etat` (3 valeurs)

```
, R, S
```

### `cgb_garanti` (2 valeurs)

```
, O
```

### `cgb_operateur` (10 valeurs)

```
, ARKON, Arrivant, BEAM, Creation, DSIOP, FAM, GIFT, JAA, MIND
```

### `cgb_date_comptable` (8 valeurs)

```
20251217, 20251218, 20251219, 20251220, 20251221, 20251222, 20251223, 20251224
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| bck_cafil025_dat_IDX_3 | NONCLUSTERED | non | cgb_date_comptable, cgb_societe, cgb_nom_prenom |
| bck_cafil025_dat_IDX_4 | NONCLUSTERED | non | cgb_date_comptable, cgb_societe, cgb_qualite, cgb_nom_prenom |
| bck_cafil025_dat_IDX_5 | NONCLUSTERED | non | cgb_date_comptable, cgb_societe, cgb_date_limit_solde |
| bck_cafil025_dat_IDX_2 | NONCLUSTERED | non | cgb_date_comptable, cgb_societe, cgb_etat |
| bck_cafil025_dat_IDX_1 | NONCLUSTERED | oui | cgb_date_comptable, cgb_societe, cgb_code_adherent |

