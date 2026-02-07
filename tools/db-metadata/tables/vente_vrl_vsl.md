# vente_vrl_vsl

**Nom logique Magic** : `vente_vrl_vsl`

| Info | Valeur |
|------|--------|
| Lignes | 11460 |
| Colonnes | 37 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `vrlvsl_id` | int | 10 | non |  | 11460 |
| 2 | `vrlvsl_societe` | nvarchar | 1 | non |  | 1 |
| 3 | `vrlvsl_compte` | int | 10 | non |  | 2940 |
| 4 | `vrlvsl_filiation` | int | 10 | non |  | 14 |
| 5 | `vrlvsl_flag_annulation` | nvarchar | 1 | non |  | 2 |
| 6 | `vrlvsl_type_article` | nvarchar | 3 | non |  | 2 |
| 7 | `vrlvsl_code_article` | int | 10 | non |  | 62 |
| 8 | `vrlvsl_qte` | int | 10 | non |  | 40 |
| 9 | `vrlvsl_montant` | float | 53 | non |  | 2221 |
| 10 | `vrlvsl_date_consommation` | char | 8 | non |  | 1340 |
| 11 | `vrlvsl_date_encaissement` | char | 8 | non |  | 1335 |
| 12 | `vrlvsl_heure_encaissement` | char | 6 | non |  | 8644 |
| 13 | `vrlvsl_date_fin_sejour` | char | 8 | non |  | 1263 |
| 14 | `vrlvsl_type_sejour` | nvarchar | 6 | non |  | 92 |
| 15 | `vrlvsl_categorie_chambre` | nvarchar | 6 | non |  | 25 |
| 16 | `vrlvsl_code_reduction` | nvarchar | 15 | non |  | 33 |
| 17 | `vrlvsl_pourcentage_reduction` | int | 10 | non |  | 8 |
| 18 | `vrlvsl_montant_reduction` | float | 53 | non |  | 2003 |
| 19 | `vrlvsl_motif_nonenreg_na` | int | 10 | non |  | 8 |
| 20 | `vrlvsl_commentaire` | nvarchar | 200 | non |  | 7167 |
| 21 | `vrlvsl_commentaire_annulation` | nvarchar | 200 | non |  | 245 |
| 22 | `vrlvsl_type_repas` | nvarchar | 10 | non |  | 5 |
| 23 | `vrlvsl_libelle` | nvarchar | 20 | oui |  | 215 |
| 24 | `vrlvsl_libelle_supplement` | nvarchar | 20 | oui |  | 9355 |
| 25 | `vrlvsl_operateur` | nvarchar | 8 | non |  | 27 |
| 26 | `vrlvsl_titre` | nvarchar | 2 | non |  | 3 |
| 27 | `vrlvsl_nom` | nvarchar | 30 | non |  | 4298 |
| 28 | `vrlvsl_prenom` | nvarchar | 10 | non |  | 5551 |
| 29 | `vrlvsl_num_rue` | nvarchar | 10 | non |  | 120 |
| 30 | `vrlvsl_nom_rue` | nvarchar | 30 | non |  | 179 |
| 31 | `vrlvsl_commune` | nvarchar | 35 | non |  | 15 |
| 32 | `vrlvsl_cp` | nvarchar | 10 | non |  | 256 |
| 33 | `vrlvsl_ville` | nvarchar | 30 | non |  | 6 |
| 34 | `vrlvsl_lieu_sejour` | nvarchar | 1 | non |  | 2 |
| 35 | `vrlvsl_id_ligne_annulation` | int | 10 | non |  | 1 |
| 36 | `vrlvsl_table_ori` | nvarchar | 2 | non |  | 3 |
| 37 | `vrlvsl_RowId_ori` | int | 10 | non |  | 7262 |

## Valeurs distinctes

### `vrlvsl_societe` (1 valeurs)

```
C
```

### `vrlvsl_filiation` (14 valeurs)

```
0, 1, 10, 12, 13, 14, 2, 3, 4, 5, 6, 7, 8, 9
```

### `vrlvsl_flag_annulation` (2 valeurs)

```
A, N
```

### `vrlvsl_type_article` (2 valeurs)

```
VRL, VSL
```

### `vrlvsl_qte` (40 valeurs)

```
1, 10, 106, 11, 12, 13, 14, 16, 17, 18, 2, 22, 23, 27, 3, 30, 31, 32, 34, 35, 37, 38, 4, 40, 44, 49, 5, 51, 52, 56, 6, 60, 63, 68, 7, 74, 75, 77, 8, 9
```

### `vrlvsl_categorie_chambre` (25 valeurs)

```
, A2, A2+, A2+A2, A2A, B2, B2+B2, B2+B2A, B2A, B4, B4T, C2, C2+, C2+C2, C2+C2A, C2A, C2A+, G1, H2, H4, S2, S2+A2, S2+B2, S2+B2A, S2A
```

### `vrlvsl_code_reduction` (33 valeurs)

```
, 100%, 100% CDV, 100% SUPPLIER, 15% EXTEND, 15% VSL OFFER, 20% EXTENSION, 20% FLASH SALE, 25 DISCOUNT, 25% EXTEND, 25% UPDISC, 25% W25, 30% CDV GEST CO, 30% EBB, 30% EXTEND, 30% FAMGO, 50% CDV, 50% CDV GEST CO, 50% FAM RDS, CHEVI, EXCEP 10%, EXTEND, FAMGO, FAMRDS, FLASH SALE, FREE CDV, FREE UP CDV, FREECV, FREEUP, PROLON, REDNA, TARIF CONTRACT., TARIF SPECIAL
```

### `vrlvsl_pourcentage_reduction` (8 valeurs)

```
0, 10, 100, 15, 20, 25, 30, 50
```

### `vrlvsl_motif_nonenreg_na` (8 valeurs)

```
0, 1, 2, 3, 4, 5, 6, 7
```

### `vrlvsl_type_repas` (5 valeurs)

```
, MIDI, MIDI SOIR, PTDEJ, SOIR
```

### `vrlvsl_operateur` (27 valeurs)

```
APPLE, ARKON   , ASSTFAM, AUNKO, BATU, BEAM, DADA    , DOREEN  , EVE, FAJAR, FAM, GIFT, ING, JAA, JAA1, JOLIE   , JOY, JULIA   , MICKY, MIMI, MIND, PLANNING, REMI, TEMMY, TIK, TOMOKA  , WELCMGR
```

### `vrlvsl_titre` (3 valeurs)

```
, Me, Mr
```

### `vrlvsl_commune` (15 valeurs)

```
, -, ., 2570, a, BLAIR ATHOLL GOLF ESTATE, BURROWS LANE, CONISBROUGH, FERNBROOK ESTATE, KARON, LONDON, MONTIGNY LE BRETONNEUX, SHAH ALAM, SUNWAY DAMAMSARA TECH PARK, TAMAN ADDA HEIGHTS
```

### `vrlvsl_ville` (6 valeurs)

```
, -, --, ., Ratsadd, SENLIS 
```

### `vrlvsl_lieu_sejour` (2 valeurs)

```
, G
```

### `vrlvsl_id_ligne_annulation` (1 valeurs)

```
0
```

### `vrlvsl_table_ori` (3 valeurs)

```
, CV, OD
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| vente_vrl_vsl_IDX_2 | NONCLUSTERED | non | vrlvsl_date_consommation |
| vente_vrl_vsl_IDX_1 | NONCLUSTERED | oui | vrlvsl_id |
| vente_vrl_vsl_IDX_3 | NONCLUSTERED | non | vrlvsl_code_article |

