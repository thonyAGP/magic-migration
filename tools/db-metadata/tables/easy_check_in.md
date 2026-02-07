# easy_check_in

**Nom logique Magic** : `easy_check_in`

| Info | Valeur |
|------|--------|
| Lignes | 1904 |
| Colonnes | 65 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `eci_code_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `eci_compte` | int | 10 | non |  | 1135 |
| 3 | `eci_filiation` | int | 10 | non |  | 12 |
| 4 | `eci_code_prestation` | nvarchar | 6 | non |  | 4 |
| 5 | `eci_categorie_prestation` | nvarchar | 1 | non |  | 1 |
| 6 | `eci_num_questionnaire` | int | 10 | non |  | 2 |
| 7 | `eci_num_categorie` | int | 10 | non |  | 6 |
| 8 | `eci_type_questionnaire` | nvarchar | 4 | non |  | 6 |
| 9 | `eci_taille` | int | 10 | non |  | 1 |
| 10 | `eci_poids` | int | 10 | non |  | 60 |
| 11 | `eci_pointure_ski` | nvarchar | 30 | non |  | 1 |
| 12 | `eci_pointure_chaussure` | nvarchar | 30 | non |  | 1 |
| 13 | `eci_niveau_pratique` | nvarchar | 2 | non |  | 1 |
| 14 | `eci_type_pratique` | nvarchar | 2 | non |  | 1 |
| 15 | `eci_type_glisse` | nvarchar | 2 | non |  | 1 |
| 16 | `eci_casque` | nvarchar | 2 | non |  | 1 |
| 17 | `eci_reglage` | nvarchar | 2 | non |  | 1 |
| 18 | `eci_num_questionnaire_cours` | int | 10 | non |  | 1 |
| 19 | `eci_num_categorie_cours` | int | 10 | non |  | 1 |
| 20 | `eci_type_cours` | nvarchar | 2 | non |  | 1 |
| 21 | `eci_niv_cours` | nvarchar | 30 | non |  | 1 |
| 22 | `eci_langue_parlee` | nvarchar | 30 | non |  | 18 |
| 23 | `eci_nom_contact` | nvarchar | 30 | non |  | 875 |
| 24 | `eci_num_portable` | nvarchar | 30 | non |  | 1153 |
| 25 | `eci_prenom_contact` | nvarchar | 30 | non |  | 1014 |
| 26 | `eci_couches` | nvarchar | 2 | non |  | 4 |
| 27 | `eci_maquillage` | nvarchar | 2 | non |  | 3 |
| 28 | `eci_doudou` | nvarchar | 30 | non |  | 3 |
| 29 | `eci_nager` | nvarchar | 2 | non |  | 3 |
| 30 | `eci_position_dormir` | nvarchar | 2 | non |  | 4 |
| 31 | `eci_allergies` | nvarchar | 30 | non |  | 1 |
| 32 | `eci_nom_autorise` | nvarchar | 30 | non |  | 733 |
| 33 | `eci_prenom_autorise` | nvarchar | 30 | non |  | 885 |
| 34 | `eci_portable_autorise` | nvarchar | 30 | non |  | 995 |
| 35 | `eci_paracetamol` | nvarchar | 2 | non |  | 15 |
| 36 | `eci_date_maj` | char | 8 | non |  | 135 |
| 37 | `eci_heure_maj` | char | 6 | non |  | 1181 |
| 38 | `eci_user_maj` | nvarchar | 8 | non |  | 26 |
| 39 | `eci_nom_autorise2` | nvarchar | 30 | non |  | 429 |
| 40 | `eci_prenom_autorise2` | nvarchar | 30 | non |  | 502 |
| 41 | `eci_portable_autorise2` | nvarchar | 30 | non |  | 541 |
| 42 | `eci_nom_autorise3` | nvarchar | 30 | non |  | 53 |
| 43 | `eci_prenom_autorise3` | nvarchar | 30 | non |  | 53 |
| 44 | `eci_portable_autorise3` | nvarchar | 30 | non |  | 54 |
| 45 | `eci_nom_contact2` | nvarchar | 30 | non |  | 445 |
| 46 | `eci_prenom_contact2` | nvarchar | 30 | non |  | 514 |
| 47 | `eci_num_portable2` | nvarchar | 30 | non |  | 550 |
| 48 | `eci_nom_contact3` | nvarchar | 30 | non |  | 35 |
| 49 | `eci_prenom_contact3` | nvarchar | 30 | non |  | 35 |
| 50 | `eci_num_portable3` | nvarchar | 30 | non |  | 36 |
| 51 | `eci_autonomie_8_ans` | nvarchar | 2 | non |  | 3 |
| 52 | `eci_niveau_pratique_snow` | nvarchar | 2 | non |  | 1 |
| 53 | `eci_type_pratique_snow` | nvarchar | 2 | non |  | 1 |
| 54 | `eci_tel_skieur` | nvarchar | 30 | non |  | 1 |
| 55 | `eci_presence_allergies` | nvarchar | 2 | non |  | 4 |
| 56 | `eci_liste_allergies` | nvarchar | 120 | non |  | 77 |
| 57 | `eci_sieste` | nvarchar | 2 | non |  | 4 |
| 58 | `eci_nickname` | nvarchar | 50 | oui |  | 176 |
| 59 | `eci_stayid_contact` | bigint | 19 | oui |  | 576 |
| 60 | `eci_stayid_contact2` | bigint | 19 | oui |  | 256 |
| 61 | `eci_stayid_contact3` | bigint | 19 | oui |  | 4 |
| 62 | `eci_stayid_autorisee` | bigint | 19 | oui |  | 591 |
| 63 | `eci_stayid_autorisee2` | bigint | 19 | oui |  | 272 |
| 64 | `eci_stayid_autorisee3` | bigint | 19 | oui |  | 6 |
| 65 | `eci_image_autorisee` | bit |  | oui |  | 1 |

## Valeurs distinctes

### `eci_code_societe` (1 valeurs)

```
C
```

### `eci_filiation` (12 valeurs)

```
0, 1, 13, 14, 2, 3, 4, 5, 6, 7, 8, 9
```

### `eci_code_prestation` (4 valeurs)

```
, APHU3Y, APHUY1, CLUENF
```

### `eci_categorie_prestation` (1 valeurs)

```
E
```

### `eci_num_questionnaire` (2 valeurs)

```
0, 62
```

### `eci_num_categorie` (6 valeurs)

```
0, 1, 2, 3, 4, 5
```

### `eci_type_questionnaire` (6 valeurs)

```
, BABY, JU11, JU14, MIN8, MINI
```

### `eci_taille` (1 valeurs)

```
0
```

### `eci_num_questionnaire_cours` (1 valeurs)

```
0
```

### `eci_num_categorie_cours` (1 valeurs)

```
0
```

### `eci_langue_parlee` (18 valeurs)

```
, /CH/EN, /CH/EN/FR, /EN, /EN/FR, /FR, AL, EN, EN/ES, EN/ES/FR, EN/FR, EN/JP, EN/JP/FR, ES, ES/FR, FR, JP, PT/FR
```

### `eci_couches` (4 valeurs)

```
, 1, 2, 3
```

### `eci_maquillage` (3 valeurs)

```
, 1, 2
```

### `eci_doudou` (3 valeurs)

```
, 1, 2
```

### `eci_nager` (3 valeurs)

```
, 1, 2
```

### `eci_position_dormir` (4 valeurs)

```
, 1, 2, 3
```

### `eci_paracetamol` (15 valeurs)

```
, 1, 2, Br, Go, Ja, Ka, Ki, Ko, Pa, Ri, Sa, Se, Sp, Yo
```

### `eci_user_maj` (26 valeurs)

```
AAUM, ADD, AYOUB, BEW, CARA, FAMILLE, FILM, JADEN, JFROST, JILLY, JINA, MAI, MANOW, MILK, NAM, NINA, PALM, PATRICK, PAULINE, PLOY, RITA, SERGIO, SOPHIA, T_ARRIV, YINI, ZIX
```

### `eci_nom_contact3` (35 valeurs)

```
, Ang, Bridoux, Choi, DADOUNE, Dehlinger, Drogoul, Enzo, ESTRADA, Ferreira, Goh, Grandet, GROSDIDIER, HOBBS, HUN-BASIRE, Jacobs, KIM, Kong, Lai, Lee, Ligny, MOCK, Mougin-Oulton, Ong, Pasquier, PAVAGEAU, Pham, Shaked, Sun Lee, TERTRE, Vidal Tuaillon, WAKABAYASHI, Watt, YING, Yum
```

### `eci_prenom_contact3` (35 valeurs)

```
, Ai Lin, Alain, Amy, Anna, Athâ€šna, Aurelien, Bâ€šatrice, Benjamin P, Chee Fock, Cynthia Wenyan, Diego, Dominique, Ettore, Fidel, Flavie, FranÂ‡oise, HUGO, Jihoon, JISEONG, Joelle, Margot, Marguerite, MI YEON, Michel, Nancy, Natalia, noga, Philippine, Sharon, Siew hor, Thi Thuy Nga, Wen Ying, Yoonseo, YUME
```

### `eci_num_portable3` (36 valeurs)

```
, +15627735624, +262692767030, +33617784483, +33621503562, +33637811752, +33642255857, +33642267118, +33644366187, +33659062975, +33662132252, +33662213112, +33664546881, +33675242889, +33678160574, +33772374478, +41782639033, +61405939032, +61413794889, +61414259985, +61467467649, +6421533333, +6581139487, +6594500558, +6596363204, +6597326724, +6598397842, +819023086150, +821032533346, +821042458735, +821046905538, +821076354133, +8617717006139, +86919676551, +97226246851, Pavageau
```

### `eci_autonomie_8_ans` (3 valeurs)

```
, 1, 2
```

### `eci_presence_allergies` (4 valeurs)

```
, +3, 1, 2
```

### `eci_sieste` (4 valeurs)

```
, 1, 2, 3
```

### `eci_stayid_contact3` (4 valeurs)

```
2149744500, 2183706101, 2304535301, 2328877601
```

### `eci_stayid_autorisee3` (6 valeurs)

```
2065892901, 2149744500, 2183706101, 2272073201, 2304535301, 2328877601
```

### `eci_image_autorisee` (1 valeurs)

```
1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| easy_check_in_IDX_1 | NONCLUSTERED | oui | eci_code_societe, eci_compte, eci_filiation, eci_num_questionnaire, eci_num_categorie |

