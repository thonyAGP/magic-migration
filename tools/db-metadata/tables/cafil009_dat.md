# cafil009_dat

| Info | Valeur |
|------|--------|
| Lignes | 10225 |
| Colonnes | 83 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `gmc_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `gmc_compte` | int | 10 | non |  | 3814 |
| 3 | `gmc_filiation_compte` | int | 10 | non |  | 18 |
| 4 | `gmc_titre` | nvarchar | 2 | non |  | 3 |
| 5 | `gmc_nom_complet` | nvarchar | 30 | non |  | 3791 |
| 6 | `gmc_prenom_complet` | nvarchar | 20 | non |  | 7493 |
| 7 | `gmc_bebe` | nvarchar | 1 | non |  | 2 |
| 8 | `gmc_type_de_client` | nvarchar | 1 | non |  | 2 |
| 9 | `gmc_numero_adherent` | float | 53 | non |  | 3902 |
| 10 | `gmc_lettre_controle` | nvarchar | 1 | non |  | 16 |
| 11 | `gmc_filiation_club` | int | 10 | non |  | 24 |
| 12 | `gmc_date_naissance` | char | 8 | non |  | 7474 |
| 13 | `gmc_ville_naissance` | nvarchar | 35 | non |  | 1 |
| 14 | `gmc_pays_naissance` | nvarchar | 3 | non |  | 37 |
| 15 | `gmc_code_inscription` | nvarchar | 3 | non |  | 37 |
| 16 | `gmc_code_vente` | nvarchar | 3 | non |  | 46 |
| 17 | `gmc_code_nationalite` | nvarchar | 2 | non |  | 46 |
| 18 | `gmc_profession` | nvarchar | 20 | non |  | 1 |
| 19 | `gmc_piece_id` | nvarchar | 1 | non |  | 1 |
| 20 | `gmc_numero_piece` | nvarchar | 30 | non |  | 3087 |
| 21 | `gmc_date_delivrance` | char | 8 | non |  | 1400 |
| 22 | `gmc_date_validite` | char | 8 | non |  | 1760 |
| 23 | `gmc_ville_delivrance` | nvarchar | 50 | non |  | 161 |
| 24 | `gmc_pays_delivrance` | nvarchar | 3 | non |  | 37 |
| 25 | `gmc_nom_commune` | nvarchar | 35 | non |  | 56 |
| 26 | `gmc_code_postal` | nvarchar | 10 | non |  | 969 |
| 27 | `gmc_ville_bureau_dis` | nvarchar | 30 | non |  | 745 |
| 28 | `gmc_etat_province` | nvarchar | 10 | non |  | 46 |
| 29 | `gmc_pays_residence` | nvarchar | 3 | non |  | 43 |
| 30 | `gmc_num_dans_la_rue` | nvarchar | 10 | non |  | 351 |
| 31 | `gmc_nom_de_la_rue` | nvarchar | 30 | non |  | 882 |
| 32 | `gmc_nationalite` | nvarchar | 50 | non |  | 49 |
| 33 | `gmc_nbre_sejour_club` | int | 10 | non |  | 93 |
| 34 | `gmc_nbre_sejour_vill` | int | 10 | non |  | 52 |
| 35 | `gmc_code_fidelite` | nvarchar | 8 | non |  | 2 |
| 36 | `gmc_liste_blanche` | nvarchar | 1 | non |  | 2 |
| 37 | `gmc_honey` | nvarchar | 1 | non |  | 3 |
| 38 | `gmc_type_resp_dette` | nvarchar | 1 | non |  | 4 |
| 39 | `gmc_resp_dette_paris` | int | 10 | non |  | 2133 |
| 40 | `gmc_numero_dossier` | int | 10 | non |  | 2848 |
| 41 | `gmc_numero_ordre` | int | 10 | non |  | 134 |
| 42 | `gmc_numero_import` | int | 10 | non |  | 114 |
| 43 | `gmc_sejour_paye` | nvarchar | 1 | non |  | 4 |
| 44 | `gmc_free` | nvarchar | 1 | non |  | 3 |
| 45 | `gmc_date_cde_forf_ski` | char | 8 | oui |  | 2 |
| 46 | `gmc_type_client_fondation` | nvarchar | 1 | non |  | 3 |
| 47 | `gmc_neol_id` | nvarchar | 18 | non |  | 9661 |
| 48 | `gmc_accept_exp_co` | bit |  | non |  | 2 |
| 49 | `gmc_code_touriste` | nvarchar | 30 | non |  | 1 |
| 50 | `gmc_numero_cpf_bresil` | nvarchar | 11 | non |  | 1 |
| 51 | `gmc_type_identite` | nvarchar | 6 | non |  | 1 |
| 52 | `gmc_cni` | nvarchar | 30 | non |  | 1 |
| 53 | `gmc_acte_naissance` | nvarchar | 30 | non |  | 1 |
| 54 | `gmc_carte_mercosul` | nvarchar | 30 | non |  | 1 |
| 55 | `gmc_telephone_fixe` | nvarchar | 30 | non |  | 1 |
| 56 | `gmc_telephone_mobile` | nvarchar | 30 | non |  | 1 |
| 57 | `gmc_pays_avant` | nvarchar | 2 | non |  | 1 |
| 58 | `gmc_pays_apres` | nvarchar | 2 | non |  | 1 |
| 59 | `gmc_raison_visite` | nvarchar | 6 | non |  | 1 |
| 60 | `gmc_transport_arrivee` | nvarchar | 6 | non |  | 1 |
| 61 | `gmc_emetteur_identite` | nvarchar | 100 | non |  | 1 |
| 62 | `gmc_etat_residence` | nvarchar | 60 | non |  | 1 |
| 63 | `gmc_ville_residence` | nvarchar | 60 | non |  | 1 |
| 64 | `gmc_ibge_ville_residence` | nvarchar | 7 | non |  | 1 |
| 65 | `gmc_etat_avant` | nvarchar | 60 | non |  | 1 |
| 66 | `gmc_ville_avant` | nvarchar | 60 | non |  | 1 |
| 67 | `gmc_ibge_ville_avant` | nvarchar | 7 | non |  | 1 |
| 68 | `gmc_etat_apres` | nvarchar | 60 | non |  | 1 |
| 69 | `gmc_ville_apres` | nvarchar | 60 | non |  | 1 |
| 70 | `gmc_ibge_ville_apres` | nvarchar | 7 | non |  | 1 |
| 71 | `gmc_immatriculation` | nvarchar | 30 | oui |  | 1 |
| 72 | `gmc_dossier_direct` | bit |  | non |  | 2 |
| 73 | `gmc_date_entree_pays` | char | 8 | non |  | 1 |
| 74 | `gmc_turkid` | nvarchar | 30 | non |  | 1 |
| 75 | `gmc_etat_origine` | nvarchar | 30 | non |  | 1 |
| 76 | `gmc_adr_libre1` | nvarchar | 35 | non |  | 1 |
| 77 | `gmc_adr_libre2` | nvarchar | 35 | non |  | 1 |
| 78 | `gmc_adr_bat_esc` | nvarchar | 10 | non |  | 1 |
| 79 | `gmc_pays_origine` | nvarchar | 30 | non |  | 1 |
| 80 | `gmc_ville_origine` | nvarchar | 30 | non |  | 1 |
| 81 | `gmc_prenom_2` | nvarchar | 20 | non |  | 82 |
| 82 | `gmc_prenom_3` | nvarchar | 20 | non |  | 24 |
| 83 | `gmc_prenom_4` | nvarchar | 20 | non |  | 3 |

## Valeurs distinctes

### `gmc_societe` (1 valeurs)

```
C
```

### `gmc_filiation_compte` (18 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 17, 2, 3, 4, 5, 6, 7, 8, 9
```

### `gmc_titre` (3 valeurs)

```
, Me, Mr
```

### `gmc_bebe` (2 valeurs)

```
N, O
```

### `gmc_type_de_client` (2 valeurs)

```
B, C
```

### `gmc_lettre_controle` (16 valeurs)

```
, A, C, D, G, J, M, N, P, Q, R, S, T, U, Y, Z
```

### `gmc_filiation_club` (24 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 16, 18, 19, 2, 20, 21, 22, 3, 4, 5, 6, 7, 8, 83, 9, 93
```

### `gmc_pays_naissance` (37 valeurs)

```
, @@, AL, AT, AU, BQ, BR, CD, CH, CO, ES, FR, GB, HK, ID, IO, IR, IS, IT, JP, MA, MO, MY, NL, NZ, PI, PL, RU, SA, SG, SN, SU, TH, TR, TW, US, ZA
```

### `gmc_code_inscription` (37 valeurs)

```
, 000, 010, 020, 030, 040, 050, 060, 070, 080, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 290, 330, 350, 360, 370, 430, 460, 470, 480, 500, 650, 700, 830
```

### `gmc_code_vente` (46 valeurs)

```
, @@, AL, AS, AT, AU, BQ, BR, CD, CH, CO, CS, ES, FR, GB, HK, ID, IM, IO, IR, IS, IT, JP, MA, MO, MU, MW, MX, MY, NL, NZ, PH, PI, PL, RU, SA, SG, SN, SU, TH, TR, TU, TW, US, ZA, ZI
```

### `gmc_code_nationalite` (46 valeurs)

```
, @@, AL, AS, AT, AU, BQ, BR, CD, CH, CO, CS, ES, FR, GB, HK, ID, IM, IO, IR, IS, IT, JP, MA, MO, MU, MW, MX, MY, NL, NZ, PH, PI, PL, RU, SA, SG, SN, SU, TH, TR, TU, TW, US, ZA, ZI
```

### `gmc_pays_delivrance` (37 valeurs)

```
, @@, AL, AT, AU, BQ, BR, CD, CH, CO, ES, FR, GB, HK, ID, IO, IR, IS, IT, JP, MA, MO, MY, NL, NZ, PI, PL, RU, SA, SG, SN, SU, TH, TR, TW, US, ZA
```

### `gmc_etat_province` (46 valeurs)

```
, **********, 76, AQUITAINE, AZ, BC, BUCKS, CA, CALIFORNIA, DC, E, FL, IL, INDIANA, JOHOR, KS, LONDON, MI, MIDLOTHIAN, MINATO, MO, NC, NH, NS, NSW, NY, PRC, QC, QLD, QUEENSLAND, R, SA, SELANGOR, SP, STOCKPORT, TKY, TX, UT, VA, VIC, VICTORIA, VIRGINIA, WA, WP, YOICHI, ZUERICH
```

### `gmc_pays_residence` (43 valeurs)

```
, 002, 005, 014, 015, 034, 042, 061, 065, 066, 072, 090, 112, 114, 115, 133, 173, 190, 191, 194, 196, 197, 206, 210, 211, 232, 236, 252, 257, 289, 314, 318, 319, 341, 362, 366, 367, 390, 398, 406, 420, 434, 605
```

### `gmc_nationalite` (49 valeurs)

```
, AFRIQUE DU SUD, ALLEMAGNE, AUSTRALIE, AUTRICHE, BELGIQUE, BRÃ‰SIL, CANADA, CHINE, CORÃ‰E, COREE DU SUD, ESPAGNE, ETATS-UNIS, Ã‰TATS-UNIS, FRANCE, HONK KONG, ILE MAURICE, INDE, INDONESIE, INDONÃ‰SIE, IRLANDE, ISRAÃ‹L, ITALIE, JAPON, MACAO, MALAISIE, MALAWI, MAROC, MAURITANIE, MEXIQUE, PAYS-BAS, PHILIPPINES, POLOGNE, ROYAUME-UNI, RUSSIE, SAMOA OCCIDENTALE, SENEGAL, SÃ‰NÃ‰GAL, SINGAPOUR, SUISSE, TAIWAN, TAÃWAN, THAILANDE, THAÃLANDE, TUNISIE, TURQUIE, ZAIRE, ZAÃRE, ZIMBABWE
```

### `gmc_code_fidelite` (2 valeurs)

```
, M
```

### `gmc_liste_blanche` (2 valeurs)

```
, N
```

### `gmc_honey` (3 valeurs)

```
, N, O
```

### `gmc_type_resp_dette` (4 valeurs)

```
, A, C, S
```

### `gmc_sejour_paye` (4 valeurs)

```
, C, D, S
```

### `gmc_free` (3 valeurs)

```
, N, O
```

### `gmc_date_cde_forf_ski` (2 valeurs)

```
00000000, 19010101
```

### `gmc_type_client_fondation` (3 valeurs)

```
, A, C
```

### `gmc_accept_exp_co` (2 valeurs)

```
0, 1
```

### `gmc_dossier_direct` (2 valeurs)

```
0, 1
```

### `gmc_date_entree_pays` (1 valeurs)

```
00000000
```

### `gmc_prenom_3` (24 valeurs)

```
, Alain, Alphonsine, Andrâ€še, Cesar, Charlotte, Claude, Dakota, Denise, Ã‰tienne, Francine, George, Goerges, Husband  K Lylak, Jacqueline, Jean, Jeanne, Josepha, Marcelle, MarlÅ¡ne, Râ€šmi, Tennessee, Yvonne, Zhiyuan Ma
```

### `gmc_prenom_4` (3 valeurs)

```
, Andrâ€še, Husband  K Lylak
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil009_dat_IDX_4 | NONCLUSTERED | oui | gmc_numero_adherent, gmc_filiation_club, gmc_type_de_client |
| cafil009_dat_IDX_3 | NONCLUSTERED | non | gmc_numero_import |
| cafil009_dat_IDX_1 | NONCLUSTERED | oui | gmc_societe, gmc_compte, gmc_filiation_compte |
| cafil009_dat_IDX_2 | NONCLUSTERED | oui | gmc_societe, gmc_type_de_client, gmc_numero_adherent, gmc_filiation_club |

