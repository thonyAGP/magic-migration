# ADH IDE 253 - Histo ventes Gratuités

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-26
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_249.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 253 |
| **Fichier XML** | Prg_249.xml |
| **Description** | Histo ventes Gratuités |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 6 |
| **Module** | ADH |
| **Dossier IDE** | Ventes |

> **Note**: Ce programme est Prg_249.xml. L'ID XML (249) peut differer de la position IDE (253).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-253.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (19 tables - 6 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #23 | `cafil001_dat` | reseau_cloture___rec | **W** | 5x |
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 1x |
| #596 | `%club_user%tmp_ecrpolice_dat` | tempo_ecran_police | **W** | 2x |
| #847 | `%club_user%_stat_lieu_vente_date` | stat_lieu_vente_date | **W** | 2x |
| #933 | `taxe_add_vente` | taxe_add_vente | **W** | 6x |
| #945 | `Table_945` | Unknown | **W** | 2x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #34 | `cafil012_dat` | hebergement______heb | R | 2x |
| #38 | `cafil016_dat` | comptable_gratuite | R | 1x |
| #40 | `cafil018_dat` | comptable________cte | R | 1x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 1x |
| #77 | `cafil055_dat` | articles_________art | R | 1x |
| #79 | `cafil057_dat` | gratuites________gra | R | 1x |
| #89 | `cafil067_dat` | moyen_paiement___mop | R | 2x |
| #197 | `caisse_artstock` | articles_en_stock | R | 2x |
| #263 | `caisse_vente` | vente | R | 1x |
| #264 | `caisse_vente_gratuite` | vente_gratuite | R | 1x |
| #728 | `arc_cctotal` | arc_cc_total | R | 1x |
| #804 | `valeur_credit_bar_defaut` | valeur_credit_bar_defaut | R | 2x |

---

## 3. PARAMETRES D'ENTREE (6)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P.Societe | ALPHA | - |
| P2 | P.Devise locale | ALPHA | - |
| P3 | P.Masque montant | ALPHA | - |
| P4 | P.Code GM | NUMERIC | - |
| P5 | P.Nom et prenom | ALPHA | - |
| P6 | P.UNI/BI | ALPHA | - |
| P7 | id | NUMERIC | - |
| P8 | date | ALPHA | - |
| P9 | heure | ALPHA | - |
| P10 | imputation | NUMERIC | - |
| P11 | sousimp | NUMERIC | - |
| P12 | paiement | UNICODE | - |
| P13 | CPTE | NUMERIC | - |
| P14 | FIL | NUMERIC | - |
| P15 | libelle | UNICODE | - |
| P16 | Libelle Suppl | UNICODE | - |
| P17 | montant | NUMERIC | - |
| P18 | gmc_nom_complet | UNICODE | - |
| P19 | gmc_prenom_complet | UNICODE | - |
| P20 | article | NUMERIC | - |
| P21 | id_annulation | NUMERIC | - |
| P22 | annulation | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| V0.Date | DATE | - |
| V0.Heure | TIME | - |
| V0.Motif annulation | ALPHA | - |
| V0.Confirmer annulation | NUMERIC | - |
| V0.Erreur ? | LOGICAL | - |
| V0.Nb type article | NUMERIC | - |
| V0.Nb mode paiement | NUMERIC | - |
| V0.Transaction Validee TPE | LOGICAL | - |
| V0.Message erreur | ALPHA | - |
| V0.VAD ? | LOGICAL | - |
| V0.Montant carte | NUMERIC | - |
| V0.Gratuite | ALPHA | - |
| V0.Dossier PMS | ALPHA | - |
| V0.Dossier AXIS | ALPHA | - |
| V0.Num Autorisation | ALPHA | - |
| V0.Deversement OK | LOGICAL | - |
| V0.Cloture en cours | LOGICAL | - |
| V0.Fin de tache ? | ALPHA | - |
| V0.Reseau | ALPHA | - |
| V0.N° ticket VRL/VSL | ALPHA | - |

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

> Total: 218 variables mappees

---

## 5. EXPRESSIONS (257 total, 101 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{32768,2}` | `VG.Retour Chariot` |
| 2 | `Date()` | `Date()` |
| 3 | `DVal({0,8},'YYYYMMDD')` | `DVal(heure,'YYYYMMDD')` |
| 4 | `TVal({0,9},'HHMMSS')` | `TVal(imputation,'HHMMSS')` |
| 5 | `Trim({0,19})&' '&Trim({0,18})` | `Trim(article)&' '&Trim(gmc_prenom_complet)` |
| 6 | `IF ({0,3}='','N15.2Z',{0,3})` | `IF (P.Code GM='','N15.2Z',P.Code GM)` |
| 7 | `{0,20}` | `id_annulation` |
| 8 | `{0,21}=0 AND {0,22}<>'A'` | `annulation=0 AND V0.Date<>'A'` |
| 9 | `IF({0,21}<>0 OR {0,22}='A',36,110)` | `IF(annulation<>0 OR V0.Date='A',36,110)` |
| 10 | `IF({0,22}='A',MlsTrans ('Annulation'),IF({0,21}<>0,MlsTra...` | `IF(V0.Date='A',MlsTrans ('Annulation'),IF(annulation<>0,M...` |
| 11 | `{0,28}='VRL' OR {0,28}='TRF' OR {0,28}='VSL'` | `V0.Nb type article='VRL' OR V0.Nb type article='TRF' OR V...` |
| 12 | `(ExpCalc('11'EXP) AND Trim({0,25})<>'') OR NOT ExpCalc('1...` | `(ExpCalc('11'EXP) AND Trim(V0.Confirmer annulation)<>'') ...` |
| 13 | `{0,26}=6` | `L.Retour_Ticket=6` |
| 14 | `ExpCalc('11'EXP) AND Trim({0,25})=''` | `ExpCalc('11'EXP) AND Trim(V0.Confirmer annulation)=''` |
| 15 | `IF({0,12}='OD','OD','')` | `IF(CPTE='OD','OD','')` |
| 16 | `{0,7}` | `date` |
| 17 | `{0,12}` | `CPTE` |
| 18 | `{0,28}` | `V0.Nb type article` |
| 19 | `{0,45}>1` | `V0.Mode paiement>1` |
| 20 | `{0,44}>1` | `V0.Chambre>1` |
| 21 | `{0,45}=1` | `V0.Mode paiement=1` |
| 22 | `{0,44}=1` | `V0.Chambre=1` |
| 23 | `DbDel('{596,4}'DSOURCE,'')` | `DbDel('{596,4}'DSOURCE,'')` |
| 24 | `DbDel('{847,4}'DSOURCE,'')` | `DbDel('{847,4}'DSOURCE,'')` |
| 25 | `{0,1}` | `P.Devise locale` |
| 26 | `'O'` | `'O'` |
| 27 | `{0,55}='F'` | `{0,55}='F'` |
| 28 | `'TRUE'LOG` | `'TRUE'LOG` |
| 29 | `'TRUE'LOG` | `'TRUE'LOG` |
| 30 | `NOT {0,62}` | `NOT {0,62}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 19 (6 W / 13 R) |
| Parametres | 6 |
| Variables locales | 50 |
| Expressions | 257 |
| Expressions 100% decodees | 101 (39%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-26 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

