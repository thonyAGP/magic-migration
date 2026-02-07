# l_clot_auto_dat

| Info | Valeur |
|------|--------|
| Lignes | 1564 |
| Colonnes | 27 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `lca_date_comptable` | char | 8 | non |  | 1564 |
| 2 | `date_debut_cloture` | char | 8 | non |  | 1564 |
| 3 | `heure_debut_cloture` | char | 6 | non |  | 638 |
| 4 | `verif_sessions` | bit |  | non |  | 1 |
| 5 | `nb_sessions` | int | 10 | non |  | 2 |
| 6 | `heure_sessions` | char | 6 | non |  | 639 |
| 7 | `gen_pieces_de_caisse` | bit |  | non |  | 1 |
| 8 | `heure_pieces_de_caisse` | char | 6 | non |  | 641 |
| 9 | `calcul_coffre` | bit |  | non |  | 1 |
| 10 | `heure_calcul_coffre` | char | 6 | non |  | 648 |
| 11 | `suppr_cartes` | bit |  | non |  | 1 |
| 12 | `heure_suppr_cartes` | char | 6 | non |  | 639 |
| 13 | `datacatching` | bit |  | non |  | 1 |
| 14 | `heure_datacatching` | char | 6 | non |  | 649 |
| 15 | `pc_change` | bit |  | non |  | 1 |
| 16 | `heure_pc_change` | char | 6 | non |  | 643 |
| 17 | `maj_solde` | bit |  | non |  | 1 |
| 18 | `heure_maj_solde` | char | 6 | non |  | 647 |
| 19 | `gen_excel` | bit |  | non |  | 1 |
| 20 | `heure_excel` | char | 6 | non |  | 654 |
| 21 | `restruct` | bit |  | non |  | 1 |
| 22 | `heure_restruct` | char | 6 | non |  | 654 |
| 23 | `maj_sessions` | bit |  | non |  | 1 |
| 24 | `heure_maj_sessions` | char | 6 | non |  | 654 |
| 25 | `fin_de_cloture` | char | 6 | non |  | 656 |
| 26 | `transfert_compta` | char | 1 | non |  | 3 |
| 27 | `heure_transfert_compta` | char | 6 | non |  | 79 |

## Valeurs distinctes

### `verif_sessions` (1 valeurs)

```
1
```

### `nb_sessions` (2 valeurs)

```
0, 1
```

### `gen_pieces_de_caisse` (1 valeurs)

```
1
```

### `calcul_coffre` (1 valeurs)

```
1
```

### `suppr_cartes` (1 valeurs)

```
1
```

### `datacatching` (1 valeurs)

```
1
```

### `pc_change` (1 valeurs)

```
1
```

### `maj_solde` (1 valeurs)

```
1
```

### `gen_excel` (1 valeurs)

```
1
```

### `restruct` (1 valeurs)

```
1
```

### `maj_sessions` (1 valeurs)

```
1
```

### `transfert_compta` (3 valeurs)

```
 , N, O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| l_clot_auto_dat_IDX_1 | NONCLUSTERED | oui | lca_date_comptable |

