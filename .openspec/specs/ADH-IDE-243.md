# ADH IDE 243 - Histo ventes payantes

> **Version spec** : 2.0
> **Genere le** : 2026-01-26
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_239.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 243 |
| **Fichier XML** | Prg_239.xml |
| **Description** | Histo ventes payantes |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 14 |
| **Module** | ADH |
| **Dossier IDE** | Ventes |

> **Note**: Ce programme est Prg_239.xml. L'ID XML (239) peut differer de la position IDE (243).

---

## 2. TABLES (25 tables - 8 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #23 | `cafil001_dat` | reseau_cloture___rec | **W** | 5x |
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 2x |
| #596 | `%club_user%tmp_ecrpolice_dat` | tempo_ecran_police | **W** | 3x |
| #847 | `%club_user%_stat_lieu_vente_date` | stat_lieu_vente_date | **W** | 3x |
| #899 | `Boo_ResultsRechercheHoraire` | Boo_ResultsRechercheHoraire | **W** | 2x |
| #911 | `log_booker` | log_booker | **W** | 1x |
| #933 | `taxe_add_vente` | taxe_add_vente | **W** | 6x |
| #945 | `Table_945` | Unknown | **W** | 4x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #34 | `cafil012_dat` | hebergement______heb | R | 3x |
| #40 | `cafil018_dat` | comptable________cte | R | 3x |
| #67 | `cafil045_dat` | tables___________tab | R | 1x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 1x |
| #77 | `cafil055_dat` | articles_________art | R | 1x |
| #79 | `cafil057_dat` | gratuites________gra | R | 1x |
| #89 | `cafil067_dat` | moyen_paiement___mop | R | 3x |
| #197 | `caisse_artstock` | articles_en_stock | R | 3x |
| #263 | `caisse_vente` | vente | R | 3x |
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
| P1 | P.Societe | ALPHA | - |
| P2 | P.Devise locale | ALPHA | - |
| P3 | P.Masque montant | ALPHA | - |
| P4 | P.Code GM | NUMERIC | - |
| P5 | P.Date fin sejour | DATE | - |
| P6 | P.Etat compte | ALPHA | - |
| P7 | P.Date solde | DATE | - |
| P8 | P.Garanti O/N | ALPHA | - |
| P9 | P.Nom et prenom | ALPHA | - |
| P10 | P.UNI/BI | ALPHA | - |
| P11 | P.Date debut sejour | DATE | - |
| P12 | P.Valide ? | NUMERIC | - |
| P13 | P.Nb decimales | NUMERIC | - |
| P14 | id | NUMERIC | - |
| P15 | date | ALPHA | - |
| P16 | heure | ALPHA | - |
| P17 | imputation | NUMERIC | - |
| P18 | sousimp | NUMERIC | - |
| P19 | service | UNICODE | - |
| P20 | paiement | UNICODE | - |
| P21 | CPTE | NUMERIC | - |
| P22 | FIL | NUMERIC | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Ref | Nom | Type | Role |
|-----|-----|------|------|
| `{0,-102}` | V0.Date | DATE | - |
| `{0,-101}` | V0.Heure | TIME | - |
| `{0,-98}` | V0.Motif annulation | ALPHA | - |
| `{0,-94}` | V0.Confirmer annulation | NUMERIC | - |
| `{0,-77}` | V0.Erreur ? | LOGICAL | - |
| `{0,-76}` | V0.Nb type article | NUMERIC | - |
| `{0,-75}` | V0.Nb mode paiement | NUMERIC | - |
| `{0,-74}` | V0.Transaction Validee TPE | LOGICAL | - |
| `{0,-73}` | V0.Message erreur | ALPHA | - |
| `{0,-72}` | V0.VAD ? | LOGICAL | - |
| `{0,-70}` | V0.Montant carte | NUMERIC | - |
| `{0,-69}` | V0.Gratuite | ALPHA | - |
| `{0,-68}` | V0.Dossier PMS | ALPHA | - |
| `{0,-67}` | V0.Dossier AXIS | ALPHA | - |
| `{0,-21}` | V0.Transaction_Id | ALPHA | - |
| `{0,-66}` | V0.Deversement OK | LOGICAL | - |
| `{0,-65}` | V0.Cloture en cours | LOGICAL | - |
| `{0,-64}` | V0.Fin de tache ? | ALPHA | - |
| `{0,-62}` | V0.Code devise | NUMERIC | - |
| `{0,-60}` | V0.Reseau | ALPHA | - |

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

> Total: 272 variables mappees

---

## 5. EXPRESSIONS (585 total, 227 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `MlsTrans('Liste des ventes du compte')` | `MlsTrans('Liste des ventes du compte')` |
| 2 | `{32768,2}` | `VG.Retour Chariot` |
| 3 | `Date()` | `Date()` |
| 4 | `DVal({0,16},'YYYYMMDD')` | `DVal(heure,'YYYYMMDD')` |
| 5 | `TVal({0,17},'HHMMSS')` | `TVal(imputation,'HHMMSS')` |
| 6 | `Trim({0,29})&' '&Trim({0,28})` | `Trim(article)&' '&Trim(gmc_prenom_complet)` |
| 7 | `IF ({0,3}='','N15.2Z',{0,3})` | `IF (P.Solde compte='','N15.2Z',P.Solde compte)` |
| 8 | `{0,30}` | `GiftPass` |
| 9 | `{0,33}=0 AND {0,34}<>'A'` | `annulation=0 AND Commentaire_Annulation<>'A'` |
| 10 | `IF({0,33}<>0 OR {0,34}='A',36,110)` | `IF(annulation<>0 OR Commentaire_Annulation='A',36,110)` |
| 11 | `IF({0,34}='A',MlsTrans ('Annulation'),IF({0,33}<>0,MlsTra...` | `IF(Commentaire_Annulation='A',MlsTrans ('Annulation'),IF(...` |
| 12 | `{0,54}<>0 OR {0,61}<>0` | `V0.Transaction_Id<>0 OR V0.Chaine compte special<>0` |
| 13 | `Trim({0,40})<>''` | `Trim(V0.Confirmer annulation)<>''` |
| 14 | `{0,41}=6` | `L.Retour_Ticket=6` |
| 15 | `Trim({0,40})=''` | `Trim(V0.Confirmer annulation)=''` |
| 16 | `IF({0,21}='OD','OD','')` | `IF(CPTE='OD','OD','')` |
| 17 | `{0,15}` | `date` |
| 18 | `{0,21}` | `CPTE` |
| 19 | `{0,43}` | `V0.Erreur ?` |
| 20 | `{0,65}>1` | `V0.Existe ligne selectionnee ?>1` |
| 21 | `{0,64}>1` | `V0.Exist ligne à annuler ?>1` |
| 22 | `{0,65}=1` | `V0.Existe ligne selectionnee ?=1` |
| 23 | `{0,64}=1` | `V0.Exist ligne à annuler ?=1` |
| 24 | `DbDel('{596,4}'DSOURCE,'')` | `DbDel('{596,4}'DSOURCE,'')` |
| 25 | `{32768,24} AND {0,69}<>0 AND NOT {0,68}` | `VG.TPE INTERFACE SUR TERMINAL AND v.Envoi ticket email<>0...` |
| 26 | `DbDel('{847,4}'DSOURCE,'')` | `DbDel('{847,4}'DSOURCE,'')` |
| 27 | `Trim({0,67})` | `Trim(V.N°Ticket Annulation)` |
| 28 | `NOT {0,66} AND {0,67}<>''` | `NOT V0.Qte AND V.N°Ticket Annulation<>''` |
| 29 | `NOT {0,66}` | `NOT V0.Qte` |
| 30 | `{0,1}` | `P.Devise locale` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 25 (8 W / 17 R) |
| Parametres | 14 |
| Variables locales | 77 |
| Expressions | 585 |
| Expressions 100% decodees | 227 (39%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-26 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*
