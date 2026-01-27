# ADH IDE 245 - Histo ventes payantes /PMS-623

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-26
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_241.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 245 |
| **Fichier XML** | Prg_241.xml |
| **Description** | Histo ventes payantes /PMS-623 |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 16 |
| **Module** | ADH |
| **Dossier IDE** | Ventes |

> **Note**: Ce programme est Prg_241.xml. L'ID XML (241) peut differer de la position IDE (245).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-245.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (26 tables - 10 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #23 | `cafil001_dat` | reseau_cloture___rec | **W** | 5x |
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 2x |
| #519 | `%club_user%_pv_rentals_dat` | pv_cust_rentals | **W** | 2x |
| #596 | `%club_user%tmp_ecrpolice_dat` | tempo_ecran_police | **W** | 6x |
| #804 | `valeur_credit_bar_defaut` | valeur_credit_bar_defaut | **W** | 6x |
| #847 | `%club_user%_stat_lieu_vente_date` | stat_lieu_vente_date | **W** | 5x |
| #899 | `Boo_ResultsRechercheHoraire` | Boo_ResultsRechercheHoraire | **W** | 2x |
| #911 | `log_booker` | log_booker | **W** | 1x |
| #933 | `taxe_add_vente` | taxe_add_vente | **W** | 9x |
| #945 | `Table_945` | Unknown | **W** | 5x |
| #34 | `cafil012_dat` | hebergement______heb | R | 5x |
| #38 | `cafil016_dat` | comptable_gratuite | R | 1x |
| #40 | `cafil018_dat` | comptable________cte | R | 4x |
| #67 | `cafil045_dat` | tables___________tab | R | 1x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 2x |
| #77 | `cafil055_dat` | articles_________art | R | 1x |
| #89 | `cafil067_dat` | moyen_paiement___mop | R | 4x |
| #197 | `caisse_artstock` | articles_en_stock | R | 4x |
| #263 | `caisse_vente` | vente | R | 4x |
| #264 | `caisse_vente_gratuite` | vente_gratuite | R | 1x |
| #285 | `email` | email | R | 1x |
| #400 | `pv_rentals_dat` | pv_cust_rentals | R | 2x |
| #473 | `%club_user%_caisse_compcais` | comptage_caisse | R | 3x |
| #728 | `arc_cctotal` | arc_cc_total | R | 1x |
| #910 | `classification_memory` | classification_memory | R | 1x |
| #1069 | `Table_1069` | Unknown | R | 1x |

---

## 3. PARAMETRES D'ENTREE (16)

| # | Nom | Type | Description |
|---|-----|------|-------------|

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.Type Operation | NUMERIC | - |
| v.Services | ALPHA | - |
| v.Onglet Histo,VAD | ALPHA | - |
| v. Flag selection lignes VAD | LOGICAL | - |
| v.Confirmation validation | NUMERIC | - |
| v.Nb lignes à valider | NUMERIC | - |
| v.Date Comptable | DATE | - |
| v.Liste Tickets | ALPHA | - |
| v.validation confirmée? | LOGICAL | - |

### 4.2 Variables globales (VG)

| Variable | Role |
|----------|------|
| VG.LOGIN | - |
| VG.USER | - |
| VG.Retour Chariot | - |
| VG.DROIT ACCES IT ? | - |
| VG.DROIT ACCES CAISSE ? | - |
| VG.BRAZIL DATACATCHING? | - |
| VG.USE MDR | - |
| VG.VRL ACTIF ? | - |
| VG.ECI ACTIF ? | - |
| VG.COMPTE CASH ACTIF ? | - |
| VG.IND SEJ PAYE ACTIF ? | - |
| VG.CODE LANGUE USER | - |
| VG.EFFECTIF ACTIF ? | - |
| VG.TAXE SEJOUR ACTIF ? | - |
| VG.N° version | - |

> Total: 168 variables mappees

---

## 5. EXPRESSIONS (794 total, 242 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `Date()` | `Date()` |
| 2 | `'V'` | `'V'` |
| 3 | `DbDel('{519,4}'DSOURCE,'')` | `DbDel('{519,4}'DSOURCE,'')` |
| 4 | `DbDel('{596,4}'DSOURCE,'')` | `DbDel('{596,4}'DSOURCE,'')` |
| 5 | `DbDel('{933,4}'DSOURCE,'')` | `DbDel('{933,4}'DSOURCE,'')` |
| 6 | `NOT {0,18}` | `NOT v.Confirmation validation` |
| 7 | `{0,18}` | `v.Confirmation validation` |
| 8 | `{0,19}=6` | `v.Nb lignes à valider=6` |
| 9 | `'Ventes payantes'` | `'Ventes payantes'` |
| 10 | `'VAD'` | `'VAD'` |
| 11 | `{0,20}>0` | `v.Date Comptable>0` |
| 12 | `'TRUE'LOG` | `'TRUE'LOG` |
| 13 | `'\ '` | `'\ '` |
| 14 | `'Tous les services'` | `'Tous les services'` |
| 15 | `'VSERV'` | `'VSERV'` |
| 16 | `'O'` | `'O'` |
| 17 | `{0,20}=-1` | `v.Date Comptable=-1` |
| 18 | `'Histo_Vtes'` | `'Histo_Vtes'` |
| 19 | `0` | `0` |
| 20 | `IF({32768,83},'V,A','V')` | `IF(VG.VG Envoi Mail paiement VAD,'V,A','V')` |
| 21 | `IF({32768,83},MlsTrans('Historique des ventes,Paiements e...` | `IF(VG.VG Envoi Mail paiement VAD,MlsTrans('Historique des...` |
| 22 | `{0,21}` | `v.Liste Tickets` |
| 23 | `{0,1}` | `P.I Devise locale` |
| 24 | `{32768,83}` | `VG.VG Envoi Mail paiement VAD` |
| 1 | `'TRUE'LOG` | `'TRUE'LOG` |
| 2 | `'FALSE'LOG` | `'FALSE'LOG` |
| 3 | `''` | `''` |
| 4 | `Trim({1,25})&Trim(Str({0,2},'8'))&','` | `Trim({1,25})&Trim(Str(P.I Masque montant,'8'))&','` |
| 5 | `Left(Trim({1,25}),Len(Trim({1,25}))-1)` | `Left(Trim({1,25}),Len(Trim({1,25}))-1)` |
| 1 | `MlsTrans('Liste des ventes du compte')` | `MlsTrans('Liste des ventes du compte')` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 26 (10 W / 16 R) |
| Parametres | 16 |
| Variables locales | 25 |
| Expressions | 794 |
| Expressions 100% decodees | 242 (30%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-26 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

