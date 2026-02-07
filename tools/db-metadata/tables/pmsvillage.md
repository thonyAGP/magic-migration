# pmsvillage

| Info | Valeur |
|------|--------|
| Lignes | 1 |
| Colonnes | 81 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `identification` | nvarchar | 3 | non |  | 1 |
| 2 | `club_med` | nvarchar | 128 | non |  | 1 |
| 3 | `village` | nvarchar | 128 | non |  | 1 |
| 4 | `adress_1` | nvarchar | 128 | non |  | 1 |
| 5 | `adress_2` | nvarchar | 128 | non |  | 1 |
| 6 | `adress_3` | nvarchar | 128 | non |  | 1 |
| 7 | `zip_city` | nvarchar | 128 | non |  | 1 |
| 8 | `phone` | nvarchar | 128 | non |  | 1 |
| 9 | `fax` | nvarchar | 128 | non |  | 1 |
| 10 | `siret` | nvarchar | 128 | non |  | 1 |
| 11 | `tva_number` | nvarchar | 128 | non |  | 1 |
| 12 | `tva_value` | float | 53 | non |  | 1 |
| 13 | `currency` | nvarchar | 3 | non |  | 1 |
| 14 | `decimal` | int | 10 | non |  | 1 |
| 15 | `insurance` | nvarchar | 64 | non |  | 1 |
| 16 | `email` | nvarchar | 128 | non |  | 1 |
| 17 | `village_saisonnier` | nvarchar | 1 | non |  | 1 |
| 18 | `date_ouverture` | char | 8 | non |  | 1 |
| 19 | `date_fermeture` | char | 8 | non |  | 1 |
| 20 | `budget_total_jhp` | float | 53 | non |  | 1 |
| 21 | `budget_total_jh_vrl` | float | 53 | non |  | 1 |
| 22 | `budget_total_jhd` | float | 53 | non |  | 1 |
| 23 | `sejour_exo_taxe` | bit |  | non |  | 1 |
| 24 | `duree_sejour_mini_exo_taxe` | int | 10 | non |  | 1 |
| 25 | `pmr_exo_taxe` | bit |  | non |  | 1 |
| 26 | `prix_jour_taxe` | float | 53 | non |  | 1 |
| 27 | `psp_id` | nvarchar | 30 | non |  | 1 |
| 28 | `axis_id` | nvarchar | 3 | non |  | 1 |
| 29 | `num_commercant` | nvarchar | 30 | non |  | 1 |
| 30 | `type_boutique` | nvarchar | 1 | non |  | 1 |
| 31 | `service_manage` | nvarchar | 4 | non |  | 1 |
| 32 | `budget_gm_arrive` | float | 53 | non |  | 1 |
| 33 | `budget_gm_vv_transporte_package` | float | 53 | non |  | 1 |
| 34 | `budget_gm_vv` | float | 53 | non |  | 1 |
| 35 | `budget_gm_vv_transfere_AHP` | float | 53 | non |  | 1 |
| 36 | `budget_gm_vv_transfere_RHP` | float | 53 | non |  | 1 |
| 37 | `budget_gm_vv_transfere_ASP` | float | 53 | non |  | 1 |
| 38 | `budget_gm_vv_transfere_RSP` | float | 53 | non |  | 1 |
| 39 | `num_commercant_EMV` | nvarchar | 30 | oui |  | 0 |
| 40 | `num_commercant_AMEX` | nvarchar | 30 | oui |  | 0 |
| 41 | `num_commercant_VAD` | nvarchar | 30 | non |  | 1 |
| 42 | `montant_max_par_versement` | float | 53 | non |  | 1 |
| 43 | `total_max_versement` | float | 53 | non |  | 1 |
| 44 | `budget_jhp_s2` | float | 53 | non |  | 1 |
| 45 | `budget_jhvrl_s2` | float | 53 | non |  | 1 |
| 46 | `budget_jhd_s2` | float | 53 | non |  | 1 |
| 47 | `budget_jhvsl` | float | 53 | non |  | 1 |
| 48 | `budget_jhvsl_s2` | float | 53 | non |  | 1 |
| 49 | `taux_change_gift_pass` | float | 53 | non |  | 1 |
| 50 | `nb_arriv_gar_club` | int | 10 | non |  | 1 |
| 51 | `delai_saisi_vsl` | int | 10 | non |  | 1 |
| 52 | `email_insurance` | nvarchar | 128 | non |  | 1 |
| 53 | `url_clubmedapp` | nvarchar | 100 | non |  | 1 |
| 54 | `key_clubmedapp` | nvarchar | 100 | non |  | 1 |
| 55 | `room_ready_heure_debut_notif` | varchar | 6 | non |  | 1 |
| 56 | `room_ready_heure_fin_notif` | varchar | 6 | non |  | 1 |
| 57 | `url_etis_housekeeping` | nvarchar | 100 | non |  | 1 |
| 58 | `login_etis_housekeeping` | nvarchar | 100 | non |  | 1 |
| 59 | `pwd_etis_housekeeping` | nvarchar | 100 | non |  | 1 |
| 60 | `menage_standard_etis` | bit |  | non |  | 1 |
| 61 | `libelle_menage_blanc_etis` | nvarchar | 50 | non |  | 1 |
| 62 | `libelle_menage_standard_etis` | nvarchar | 50 | non |  | 1 |
| 63 | `code_acces_ws_police_bresil` | nvarchar | 50 | non |  | 1 |
| 64 | `endpoint_ws_police_bresil` | nvarchar | 100 | non |  | 1 |
| 65 | `libelle_menage_changement_etis` | nvarchar | 50 | non |  | 1 |
| 66 | `timeout_vad` | int | 10 | non |  | 1 |
| 67 | `heure_liberation_chambre` | varchar | 6 | non |  | 1 |
| 68 | `api_clud_med_client_id` | nvarchar | 100 | non |  | 1 |
| 69 | `api_clud_med_client_secret` | nvarchar | 100 | non |  | 1 |
| 70 | `api_clud_med_login_url` | nvarchar | 100 | non |  | 1 |
| 71 | `api_clud_med_url` | nvarchar | 100 | non |  | 1 |
| 72 | `api_clud_med_api_key` | nvarchar | 100 | non |  | 1 |
| 73 | `api_clubmed_bypass_proxy_local` | bit |  | non |  | 1 |
| 74 | `email_support` | nvarchar | 128 | oui |  | 0 |
| 75 | `seuil_service` | float | 53 | non |  | 1 |
| 76 | `seuil_produit` | float | 53 | non |  | 1 |
| 77 | `nb_jour_desaf_gar_club` | tinyint | 3 | non |  | 1 |
| 78 | `heure_dejeuner` | char | 6 | non |  | 1 |
| 79 | `mtt_piece_caisse_autorisation` | float | 53 | non |  | 1 |
| 80 | `plafond_FDR` | float | 53 | non |  | 1 |
| 81 | `plafond_FDR_Coffre2` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `identification` (1 valeurs)

```
116
```

### `club_med` (1 valeurs)

```
Phuket
```

### `village` (1 valeurs)

```
HOLIDAY VILLAGES
```

### `adress_1` (1 valeurs)

```
(Thailand) Co.,Ltd
```

### `adress_2` (1 valeurs)

```
3 Kata Road-Karon, Muang
```

### `adress_3` (1 valeurs)

```
Mueng District - Phuket 83100
```

### `zip_city` (1 valeurs)

```
Phuket 83100 Thailand
```

### `fax` (1 valeurs)

```
(66) 763 304 45
```

### `tva_number` (1 valeurs)

```
0-1055-27003-03-8
```

### `tva_value` (1 valeurs)

```
7
```

### `currency` (1 valeurs)

```
THB
```

### `decimal` (1 valeurs)

```
2
```

### `email` (1 valeurs)

```
Phuccrec01@clubmed.com
```

### `village_saisonnier` (1 valeurs)

```
N
```

### `date_ouverture` (1 valeurs)

```
20171101
```

### `date_fermeture` (1 valeurs)

```
20180430
```

### `budget_total_jhp` (1 valeurs)

```
98498
```

### `budget_total_jh_vrl` (1 valeurs)

```
488
```

### `budget_total_jhd` (1 valeurs)

```
158667
```

### `sejour_exo_taxe` (1 valeurs)

```
0
```

### `duree_sejour_mini_exo_taxe` (1 valeurs)

```
0
```

### `pmr_exo_taxe` (1 valeurs)

```
0
```

### `prix_jour_taxe` (1 valeurs)

```
1
```

### `type_boutique` (1 valeurs)

```
I
```

### `budget_gm_arrive` (1 valeurs)

```
0
```

### `budget_gm_vv_transporte_package` (1 valeurs)

```
0
```

### `budget_gm_vv` (1 valeurs)

```
0
```

### `budget_gm_vv_transfere_AHP` (1 valeurs)

```
0
```

### `budget_gm_vv_transfere_RHP` (1 valeurs)

```
0
```

### `budget_gm_vv_transfere_ASP` (1 valeurs)

```
0
```

### `budget_gm_vv_transfere_RSP` (1 valeurs)

```
0
```

### `montant_max_par_versement` (1 valeurs)

```
0
```

### `total_max_versement` (1 valeurs)

```
0
```

### `budget_jhp_s2` (1 valeurs)

```
96388
```

### `budget_jhvrl_s2` (1 valeurs)

```
557
```

### `budget_jhd_s2` (1 valeurs)

```
157945
```

### `budget_jhvsl` (1 valeurs)

```
0
```

### `budget_jhvsl_s2` (1 valeurs)

```
0
```

### `taux_change_gift_pass` (1 valeurs)

```
37.1
```

### `nb_arriv_gar_club` (1 valeurs)

```
0
```

### `delai_saisi_vsl` (1 valeurs)

```
21
```

### `url_clubmedapp` (1 valeurs)

```
https://api-v1.b2c.clubmed.prod.eurelis.info/
```

### `key_clubmedapp` (1 valeurs)

```
thEK8Pd9zB5XniViqAMEi4dD9RvMp5Nq1FE44Qv8
```

### `menage_standard_etis` (1 valeurs)

```
0
```

### `timeout_vad` (1 valeurs)

```
0
```

### `heure_liberation_chambre` (1 valeurs)

```
000000
```

### `api_clud_med_client_id` (1 valeurs)

```
120cca0e-6ea8-405e-ba7e-4d531e44d163
```

### `api_clud_med_client_secret` (1 valeurs)

```
edbd09f77f1c53e4a9ff
```

### `api_clud_med_login_url` (1 valeurs)

```
https://auth.clubmed.com/token
```

### `api_clud_med_url` (1 valeurs)

```
https://api.clubmed.com/v0/bookings/
```

### `api_clud_med_api_key` (1 valeurs)

```
201908061614.pms.clubmed.com
```

### `api_clubmed_bypass_proxy_local` (1 valeurs)

```
0
```

### `seuil_service` (1 valeurs)

```
0
```

### `seuil_produit` (1 valeurs)

```
0
```

### `nb_jour_desaf_gar_club` (1 valeurs)

```
1
```

### `heure_dejeuner` (1 valeurs)

```
140000
```

### `mtt_piece_caisse_autorisation` (1 valeurs)

```
0
```

### `plafond_FDR` (1 valeurs)

```
0
```

### `plafond_FDR_Coffre2` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pmsvillage_IDX_1 | NONCLUSTERED | oui | identification |

