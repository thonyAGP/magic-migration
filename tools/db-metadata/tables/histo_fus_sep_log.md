# histo_fus_sep_log

| Info | Valeur |
|------|--------|
| Lignes | 26941 |
| Colonnes | 11 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chrono_f_e` | float | 53 | non |  | 2762 |
| 2 | `chrono` | int | 10 | non |  | 5 |
| 3 | `code` | nvarchar | 5 | non |  | 12 |
| 4 | `texte` | nvarchar | 40 | non |  | 29 |
| 5 | `status` | nvarchar | 10 | non |  | 3 |
| 6 | `date` | char | 8 | non |  | 705 |
| 7 | `heure` | char | 6 | non |  | 9123 |
| 8 | `terminal` | int | 10 | non |  | 20 |
| 9 | `utilisateur` | nvarchar | 8 | non |  | 66 |
| 10 | `type_f_e` | nvarchar | 1 | non |  | 2 |
| 11 | `hostname_f_e` | nvarchar | 50 | non |  | 2 |

## Valeurs distinctes

### `chrono` (5 valeurs)

```
0, 1, 2, 3, 4
```

### `code` (12 valeurs)

```
00/00, 1F/10, 1F/20, 1F/30, 2T/10, 3E/10, 3E/20, 3E/30, 3E/40, 3E/50, 3E/60, 99/99
```

### `texte` (29 valeurs)

```
00/00 - Debut Fusion, 00/00 - Debut Separation, 1F/10 - Blocage cl?ture, 1F/10 - Blocage Cl?ture, 1F/10 - Blocage clÃ´ture, 1F/10 - Blocage ClÃ´ture, 1F/20 - Blocage compte reference, 1F/20 - Blocage Compte Reference, 1F/30 - Selection des GM, 2T/10 - Traitement des fichiers, 2T/10 - Traitement des Fichiers, 3E/10 - Calcul Compte GM, 3E/10 - Edition du ticket, 3E/20 - calcul compte GM, 3E/20 - Edition du Ticket, 3E/30 - calcul ancien compte, 3E/30 - Date Solde Compte Reference, 3E/40 - calcul nouveau compte. 1 compte, 3E/40 - calcul nouveau compte. N comptes, 3E/40 - Deblocage GM non valide, 3E/50 - deblocage compte reference, 3E/50 - Deblocage Compte Reference, 3E/60 - deblocage cl?ture, 3E/60 - Deblocage Cl?ture, 3E/60 - deblocage clÃ´ture, 3E/60 - Deblocage ClÃ´ture, 99/99 - Fin Fusion, 99/99 - fin separation, 99/99 - Fin Separation
```

### `status` (3 valeurs)

```
DONE, PASSED, RETRY
```

### `terminal` (20 valeurs)

```
0, 300, 430, 431, 432, 433, 500, 520, 540, 551, 570, 770, 80, 801, 810, 90, 91, 960, 980, 990
```

### `type_f_e` (2 valeurs)

```
E, F
```

### `hostname_f_e` (2 valeurs)

```
, Odyssey
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| histo_fus_sep_log_IDX_1 | NONCLUSTERED | oui | chrono_f_e, chrono, code |
| histo_fus_sep_log_IDX_2 | NONCLUSTERED | oui | chrono_f_e, code, chrono |

