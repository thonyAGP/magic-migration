# cafil130_dat

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 32 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `pbx_cle` | nvarchar | 1 | non |  | 1 |
| 2 | `pbx_type_trait__1` | nvarchar | 1 | non |  | 1 |
| 3 | `pbx_attente_____1` | char | 6 | non |  | 1 |
| 4 | `pbx_faire_______1` | nvarchar | 1 | non |  | 1 |
| 5 | `pbx_type_trait__2` | nvarchar | 1 | non |  | 1 |
| 6 | `pbx_attente_____2` | char | 6 | non |  | 1 |
| 7 | `pbx_faire_______2` | nvarchar | 1 | non |  | 1 |
| 8 | `pbx_gettel_dir_fic` | nvarchar | 40 | non |  | 1 |
| 9 | `pbx_gettel_log` | nvarchar | 40 | non |  | 1 |
| 10 | `pbx_puttel_fic_resul` | nvarchar | 40 | non |  | 1 |
| 11 | `pbx_puttel_fic_log` | nvarchar | 40 | non |  | 1 |
| 12 | `pbx_puttel_directory` | nvarchar | 40 | non |  | 1 |
| 13 | `pbx_test_ou_exploit_` | nvarchar | 1 | non |  | 1 |
| 14 | `pbx_detruit_tampon` | nvarchar | 1 | non |  | 1 |
| 15 | `pbx_detruit_ascii` | nvarchar | 1 | non |  | 1 |
| 16 | `pbx_detruit_afaire` | nvarchar | 1 | non |  | 1 |
| 17 | `pbx_blanc_ou_couleur` | nvarchar | 1 | non |  | 1 |
| 18 | `pbx_type_transmissio` | int | 10 | non |  | 1 |
| 19 | `pbx_num_article` | int | 10 | non |  | 1 |
| 20 | `pbx_sauvegarde` | nvarchar | 1 | non |  | 1 |
| 21 | `pbx_debut_sauvegarde` | char | 6 | non |  | 1 |
| 22 | `pbx_fin_sauvegarde` | char | 6 | non |  | 1 |
| 23 | `pbx_cout_taxe` | float | 53 | non |  | 1 |
| 24 | `pbx_date__modif_` | char | 8 | non |  | 1 |
| 25 | `pbx_heure_modif_` | char | 6 | non |  | 1 |
| 26 | `pbx_article_cabine` | int | 10 | non |  | 1 |
| 27 | `pbx_interface_txt` | nvarchar | 1 | non |  | 1 |
| 28 | `pbx_triplet_extension_nom` | nvarchar | 1 | non |  | 1 |
| 29 | `pbx_verif_pooling_room_status` | nvarchar | 1 | non |  | 1 |
| 30 | `pbx_edtion_tickets` | nvarchar | 1 | non |  | 1 |
| 31 | `pbx_wordgroup` | nvarchar | 1 | non |  | 1 |
| 32 | `pbx_user` | nvarchar | 11 | non |  | 1 |

## Valeurs distinctes

### `pbx_type_trait__1` (1 valeurs)

```
P
```

### `pbx_attente_____1` (1 valeurs)

```
000005
```

### `pbx_faire_______1` (1 valeurs)

```
O
```

### `pbx_type_trait__2` (1 valeurs)

```
G
```

### `pbx_attente_____2` (1 valeurs)

```
000005
```

### `pbx_faire_______2` (1 valeurs)

```
O
```

### `pbx_gettel_dir_fic` (1 valeurs)

```
C:\DATA\EXCHANGE\RESULT.2
```

### `pbx_gettel_log` (1 valeurs)

```
C:\DATA\EXCHANGE\GETTEL.LOG
```

### `pbx_puttel_fic_resul` (1 valeurs)

```
C:\DATA\EXCHANGE\RESULT
```

### `pbx_puttel_fic_log` (1 valeurs)

```
C:\DATA\EXCHANGE\PUTTEL.LOG
```

### `pbx_puttel_directory` (1 valeurs)

```
C:\DATA\EXCHANGE
```

### `pbx_test_ou_exploit_` (1 valeurs)

```
E
```

### `pbx_detruit_tampon` (1 valeurs)

```
O
```

### `pbx_detruit_ascii` (1 valeurs)

```
O
```

### `pbx_detruit_afaire` (1 valeurs)

```
O
```

### `pbx_blanc_ou_couleur` (1 valeurs)

```
C
```

### `pbx_type_transmissio` (1 valeurs)

```
7
```

### `pbx_num_article` (1 valeurs)

```
550
```

### `pbx_sauvegarde` (1 valeurs)

```
N
```

### `pbx_debut_sauvegarde` (1 valeurs)

```
020000
```

### `pbx_fin_sauvegarde` (1 valeurs)

```
030000
```

### `pbx_cout_taxe` (1 valeurs)

```
0.74
```

### `pbx_date__modif_` (1 valeurs)

```
20101019
```

### `pbx_heure_modif_` (1 valeurs)

```
000145
```

### `pbx_article_cabine` (1 valeurs)

```
551
```

### `pbx_interface_txt` (1 valeurs)

```
O
```

### `pbx_triplet_extension_nom` (1 valeurs)

```
O
```

### `pbx_verif_pooling_room_status` (1 valeurs)

```
N
```

### `pbx_edtion_tickets` (1 valeurs)

```
B
```

### `pbx_wordgroup` (1 valeurs)

```
M
```

### `pbx_user` (1 valeurs)

```
RAT
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil130_dat_IDX_1 | NONCLUSTERED | oui | pbx_cle |

