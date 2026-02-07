# cafil003_dat

| Info | Valeur |
|------|--------|
| Lignes | 59 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pim_code_imprimante` | int | 10 | non |  | 5 |
| 2 | `pim_num_commande` | int | 10 | non |  | 21 |
| 3 | `pim_libelle_commande` | nvarchar | 20 | non |  | 27 |
| 4 | `pim_sequence` | nvarchar | 24 | non |  | 25 |
| 5 | `date_purge` | char | 8 | non |  | 1 |

## Valeurs distinctes

### `pim_code_imprimante` (5 valeurs)

```
1, 5, 6, 7, 9
```

### `pim_num_commande` (21 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 2, 3, 33, 4, 5, 6, 66, 7, 72, 8, 9
```

### `pim_libelle_commande` (27 valeurs)

```
33 Lignes, 66 Lignes, 72 Lignes, Centrage code barre, CondensÃ©, DÃ©tection papier, Ejection, EPSON 300D, EPSON 930II, EPSON L60 code barre, EPSON TMT88, Fin code barre, Font HRI code barre, Hauteur code barre, HRI code barre, IBM PROPRINTER XL24, Inhibe panel, Inhibe Panel, Initialisation, Large, Largeur code barre, Massicot, Normal, SÃ©lection feuille, SÃ©lection rouleau, Type code bare, Type code barre
```

### `pim_sequence` (25 valeurs)

```
, 000, 012, 027033000, 027033001, 027033176, 027064, 027097001, 027099048001, 027099048002, 027099048004, 027099052001, 027099052005, 027099052051, 027099053001, 027105, 029072002, 029102001, 029104050, 029104060, 029107004, 029119003, C!, CB, CH
```

### `date_purge` (1 valeurs)

```
00000000
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil003_dat_IDX_1 | NONCLUSTERED | oui | pim_code_imprimante, pim_num_commande |

