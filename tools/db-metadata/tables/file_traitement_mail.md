# file_traitement_mail

**Nom logique Magic** : `file_traitement_mail`

| Info | Valeur |
|------|--------|
| Lignes | 844 |
| Colonnes | 22 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ftm_code_traitement` | nvarchar | 10 | non |  | 10 |
| 2 | `ftm_date_creation` | varchar | 8 | non |  | 92 |
| 3 | `ftm_heure_creation` | varchar | 6 | non |  | 424 |
| 4 | `ftm_date_envoi` | varchar | 8 | non |  | 41 |
| 5 | `ftm_heure_envoi` | varchar | 6 | non |  | 57 |
| 6 | `ftm_fichier_a_envoyer` | nvarchar | 256 | non |  | 844 |
| 7 | `ftm_adresse_mail_to` | nvarchar | 100 | non |  | 660 |
| 8 | `ftm_adresse_mail_from` | nvarchar | 100 | non |  | 2 |
| 9 | `ftm_statut_traitement` | bit |  | non |  | 2 |
| 10 | `ftm_nb_essai` | int | 10 | non |  | 3 |
| 11 | `ftm_langue` | nvarchar | 3 | non |  | 3 |
| 12 | `ftm_adresse_mail_cc` | nvarchar | 100 | non |  | 6 |
| 13 | `ftm_statut_cc` | bit |  | non |  | 2 |
| 14 | `ftm_date_envoi_cc` | varchar | 8 | non |  | 19 |
| 15 | `ftm_heure_envoi_cc` | varchar | 6 | non |  | 24 |
| 16 | `ftm_nb_essai_cc` | int | 10 | non |  | 2 |
| 17 | `ftm_code_for_file` | int | 10 | non |  | 35 |
| 18 | `ftm_compte` | int | 10 | non |  | 627 |
| 19 | `ftm_filiation` | int | 10 | non |  | 6 |
| 20 | `ftm_url_vad_ogone` | nvarchar | 2000 | non |  | 1 |
| 21 | `ftm_date_application` | datetime |  | oui |  | 0 |
| 22 | `ftm_complement` | varchar | 50 | non |  | 1 |

## Valeurs distinctes

### `ftm_code_traitement` (10 valeurs)

```
ACTIVECO, DUPLICMOB, EXTRAITECO, EXTRCOMPTE, FACT_ECO, GARANTMOB, MAIL_ECO, TESTECO, TICKETADH, TICKETMOB
```

### `ftm_date_envoi` (41 valeurs)

```
00000000, 20250930, 20251001, 20251009, 20251010, 20251012, 20251013, 20251014, 20251015, 20251016, 20251020, 20251022, 20251025, 20251029, 20251030, 20251031, 20251103, 20251104, 20251105, 20251109, 20251110, 20251112, 20251114, 20251115, 20251116, 20251119, 20251120, 20251122, 20251124, 20251125, 20251126, 20251129, 20251130, 20251201, 20251203, 20251204, 20251206, 20251210, 20251222, 20251223, 20251224
```

### `ftm_adresse_mail_from` (2 valeurs)

```
, syspms@clubmed.com
```

### `ftm_statut_traitement` (2 valeurs)

```
0, 1
```

### `ftm_nb_essai` (3 valeurs)

```
0, 1, 4
```

### `ftm_langue` (3 valeurs)

```
, ENG, FRA
```

### `ftm_adresse_mail_cc` (6 valeurs)

```
, Phuccbar01@clubmed.com, Phuccrec01@clubmed.com, phucfitn01@clubmed.com, phuckitc03@clubmed.com, www.clubmed.co.th
```

### `ftm_statut_cc` (2 valeurs)

```
0, 1
```

### `ftm_date_envoi_cc` (19 valeurs)

```
00000000, 20251009, 20251012, 20251013, 20251014, 20251015, 20251016, 20251020, 20251029, 20251105, 20251110, 20251112, 20251114, 20251125, 20251129, 20251210, 20251222, 20251223, 20251224
```

### `ftm_heure_envoi_cc` (24 valeurs)

```
000000, 091508, 100008, 100509, 103009, 104009, 105509, 110509, 111509, 114010, 120517, 121510, 130509, 131008, 153509, 155009, 161509, 172008, 172509, 173009, 182009, 183010, 184009, 185509
```

### `ftm_nb_essai_cc` (2 valeurs)

```
0, 1
```

### `ftm_code_for_file` (35 valeurs)

```
0, 100029, 100252, 100743, 101009, 101103, 101114, 101197, 101208, 101213, 101214, 101215, 101217, 101218, 101243, 96753, 97030, 97090, 97121, 97145, 97387, 97388, 97390, 97524, 97801, 98060, 98454, 98685, 98689, 98747, 98782, 98896, 99284, 99481, 99679
```

### `ftm_filiation` (6 valeurs)

```
0, 1, 2, 3, 4, 6
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| file_traitement_mail_IDX1 | NONCLUSTERED | oui | ftm_code_traitement, ftm_fichier_a_envoyer, ftm_statut_traitement |

