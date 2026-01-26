# ADH IDE 244 - Histo ventes payantes /PMS-605

> **Version spec** : 2.0
> **Genere le** : 2026-01-26
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_240.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 244 |
| **Fichier XML** | Prg_240.xml |
| **Description** | Histo ventes payantes /PMS-605 |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 14 |
| **Module** | ADH |
| **Dossier IDE** | Ventes |

> **Note**: Ce programme est Prg_240.xml. L'ID XML (240) peut differer de la position IDE (244).

---

## 2. TABLES (26 tables - 9 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #23 | `cafil001_dat` | reseau_cloture___rec | **W** | 5x |
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 2x |
| #519 | `%club_user%_pv_rentals_dat` | pv_cust_rentals | **W** | 2x |
| #596 | `%club_user%tmp_ecrpolice_dat` | tempo_ecran_police | **W** | 5x |
| #847 | `%club_user%_stat_lieu_vente_date` | stat_lieu_vente_date | **W** | 3x |
| #899 | `Boo_ResultsRechercheHoraire` | Boo_ResultsRechercheHoraire | **W** | 2x |
| #911 | `log_booker` | log_booker | **W** | 1x |
| #933 | `taxe_add_vente` | taxe_add_vente | **W** | 7x |
| #945 | `Table_945` | Unknown | **W** | 5x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #34 | `cafil012_dat` | hebergement______heb | R | 3x |
| #40 | `cafil018_dat` | comptable________cte | R | 4x |
| #67 | `cafil045_dat` | tables___________tab | R | 1x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 2x |
| #77 | `cafil055_dat` | articles_________art | R | 1x |
| #79 | `cafil057_dat` | gratuites________gra | R | 1x |
| #89 | `cafil067_dat` | moyen_paiement___mop | R | 3x |
| #197 | `caisse_artstock` | articles_en_stock | R | 3x |
| #263 | `caisse_vente` | vente | R | 4x |
| #285 | `email` | email | R | 1x |
| #400 | `pv_rentals_dat` | pv_cust_rentals | R | 2x |
| #473 | `%club_user%_caisse_compcais` | comptage_caisse | R | 3x |
| #728 | `arc_cctotal` | arc_cc_total | R | 1x |
| #804 | `valeur_credit_bar_defaut` | valeur_credit_bar_defaut | R | 3x |
| #910 | `classification_memory` | classification_memory | R | 1x |
| #1069 | `Table_1069` | Unknown | R | 1x |

---

## 3. PARAMETRES D'ENTREE (14)

| # | Nom | Type | Description |
|---|-----|------|-------------|

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Ref | Nom | Type | Role |
|-----|-----|------|------|
| `{0,-102}` | v.Onglet Histo,VAD | ALPHA | - |
| `{0,-97}` | v.Flag selection lignes VAD | LOGICAL | - |
| `{0,-96}` | v.Confirmation validation | NUMERIC | - |
| `{0,-95}` | v.Nb lignes à valider | NUMERIC | - |
| `{0,-94}` | v.Date Comptable | DATE | - |
| `{0,-91}` | v.Liste Tickets | ALPHA | - |
| `{0,-92}` | v.Validation est confirmée? | LOGICAL | - |

### 4.2 Variables globales (VG)

| Ref | Decode | Role |
|-----|--------|------|
| `{32768,0}` | VG.LOGIN | - |
| `{32768,1}` | VG.USER | - |
| `{32768,2}` | VG.Retour Chariot | - |
| `{32768,3}` | VG.DROIT ACCES IT ? | - |
| `{32768,4}` | VG.DROIT ACCES CAISSE ? | - |
| `{32768,5}` | VG.BRAZIL DATACATCHING? | - |
| `{32768,6}` | VG.USE MDR | - |
| `{32768,7}` | VG.VRL ACTIF ? | - |
| `{32768,8}` | VG.ECI ACTIF ? | - |
| `{32768,9}` | VG.COMPTE CASH ACTIF ? | - |
| `{32768,10}` | VG.IND SEJ PAYE ACTIF ? | - |
| `{32768,11}` | VG.CODE LANGUE USER | - |
| `{32768,12}` | VG.EFFECTIF ACTIF ? | - |
| `{32768,13}` | VG.TAXE SEJOUR ACTIF ? | - |
| `{32768,14}` | VG.N° version | - |

> Total: 160 variables mappees

---

## 5. EXPRESSIONS (646 total, 200 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `Date()` | `Date()` |
| 2 | `'V'` | `'V'` |
| 3 | `DbDel('{519,4}'DSOURCE,'')` | `DbDel('{519,4}'DSOURCE,'')` |
| 4 | `DbDel('{596,4}'DSOURCE,'')` | `DbDel('{596,4}'DSOURCE,'')` |
| 5 | `NOT {0,16}` | `NOT v.Confirmation validation` |
| 6 | `{0,16}` | `v.Confirmation validation` |
| 7 | `{0,17}=6` | `v.Nb lignes à valider=6` |
| 8 | `'Ventes payantes'` | `'Ventes payantes'` |
| 9 | `'VAD'` | `'VAD'` |
| 10 | `{0,18}>0` | `v.Date Comptable>0` |
| 11 | `'TRUE'LOG` | `'TRUE'LOG` |
| 12 | `{0,19}` | `v.Liste Tickets` |
| 13 | `{0,1}` | `P.I Devise locale` |
| 14 | `{32768,83}` | `VG.VG Envoi Mail paiement VAD` |
| 15 | `{32768,83} AND {0,20}` | `VG.VG Envoi Mail paiement VAD AND v.Validation est confir...` |
| 3 | `''` | `''` |
| 1 | `'TRUE'LOG` | `'TRUE'LOG` |
| 2 | `'FALSE'LOG` | `'FALSE'LOG` |
| 4 | `Trim({1,21})&Trim(Str({0,2},'8'))&','` | `Trim({1,21})&Trim(Str(P.I Masque montant,'8'))&','` |
| 5 | `Left(Trim({1,21}),Len(Trim({1,21}))-1)` | `Left(Trim({1,21}),Len(Trim({1,21}))-1)` |
| 1 | `MlsTrans('Liste des ventes du compte')` | `MlsTrans('Liste des ventes du compte')` |
| 2 | `DVal({0,2},'YYYYMMDD')` | `DVal(P.I Masque montant,'YYYYMMDD')` |
| 3 | `TVal({0,3},'HHMMSS')` | `TVal(P.I Solde compte,'HHMMSS')` |
| 4 | `Trim({0,15})&' '&Trim({0,14})` | `Trim(v.Flag selection lignes VAD)&' '&Trim(v.Onglet Histo...` |
| 5 | `IF ({1,3}='','N15.2Z',{1,3})` | `IF ({1,3}='','N15.2Z',{1,3})` |
| 6 | `{0,16}` | `v.Confirmation validation` |
| 7 | `{0,19}=0 AND {0,20}<>'A'` | `v.Liste Tickets=0 AND v.Validation est confirmée?<>'A'` |
| 8 | `IF({0,19}<>0 OR {0,20}='A',36,110)` | `IF(v.Liste Tickets<>0 OR v.Validation est confirmée?='A',...` |
| 9 | `IF({0,20}='A',MlsTrans ('Annulation'),IF({0,19}<>0,MlsTra...` | `IF(v.Validation est confirmée?='A',MlsTrans ('Annulation'...` |
| 10 | `{0,51}<>0` | `{0,51}<>0` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 26 (9 W / 17 R) |
| Parametres | 14 |
| Variables locales | 21 |
| Expressions | 646 |
| Expressions 100% decodees | 200 (31%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-26 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*
