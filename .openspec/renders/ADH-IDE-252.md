# ADH IDE 252 - Histo ventes IGR

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-26
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_248.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 252 |
| **Fichier XML** | Prg_248.xml |
| **Description** | Histo ventes IGR |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 14 |
| **Module** | ADH |
| **Dossier IDE** | Ventes |

> **Note**: Ce programme est Prg_248.xml. L'ID XML (248) peut differer de la position IDE (252).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-252.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (13 tables - 6 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #23 | `cafil001_dat` | reseau_cloture___rec | **W** | 5x |
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 1x |
| #596 | `%club_user%tmp_ecrpolice_dat` | tempo_ecran_police | **W** | 2x |
| #804 | `valeur_credit_bar_defaut` | valeur_credit_bar_defaut | **W** | 4x |
| #847 | `%club_user%_stat_lieu_vente_date` | stat_lieu_vente_date | **W** | 2x |
| #933 | `taxe_add_vente` | taxe_add_vente | **W** | 5x |
| #34 | `cafil012_dat` | hebergement______heb | R | 2x |
| #40 | `cafil018_dat` | comptable________cte | R | 1x |
| #67 | `cafil045_dat` | tables___________tab | R | 1x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 1x |
| #197 | `caisse_artstock` | articles_en_stock | R | 1x |
| #263 | `caisse_vente` | vente | R | 1x |
| #728 | `arc_cctotal` | arc_cc_total | R | 1x |

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
| P14 | V0.Motif annulation | ALPHA | - |
| P15 | V0.Confirmer annulation | NUMERIC | - |
| P16 | V0.Erreur ? | LOGICAL | - |
| P17 | V0.Nb type article | NUMERIC | - |
| P18 | V0.Transaction Validee TPE | LOGICAL | - |
| P19 | V0.Message erreur | ALPHA | - |
| P20 | V0.VAD ? | LOGICAL | - |
| P21 | V0.Montant carte | NUMERIC | - |
| P22 | V0.Gratuite | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| V.Date dépassée pour Annulation | LOGICAL | - |
| V0.Motif annulation | ALPHA | - |
| V0.Confirmer annulation | NUMERIC | - |
| V0.Erreur ? | LOGICAL | - |
| V0.Nb type article | NUMERIC | - |
| V0.Transaction Validee TPE | LOGICAL | - |
| V0.Message erreur | ALPHA | - |
| V0.VAD ? | LOGICAL | - |
| V0.Montant carte | NUMERIC | - |
| V0.Gratuite | ALPHA | - |
| V0.Dossier PMS | ALPHA | - |
| V0.Dossier AXIS | ALPHA | - |
| V0.Deversement OK | LOGICAL | - |
| V0.Cloture en cours | LOGICAL | - |
| V0.Fin de tache ? | ALPHA | - |
| V0.Code devise | NUMERIC | - |
| V0.Reseau | ALPHA | - |
| V0.N° ticket VRL/VSL | ALPHA | - |
| V0.Chaine compte spécial | ALPHA | - |
| V0.Chambre | ALPHA | - |

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

> Total: 196 variables mappees

---

## 5. EXPRESSIONS (209 total, 84 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{32768,2}` | `VG.Retour Chariot` |
| 2 | `Date()` | `Date()` |
| 3 | `IF ({0,3}='','N15.2Z',{0,3})` | `IF (P.Solde compte='','N15.2Z',P.Solde compte)` |
| 4 | `{0,39}=0 AND {0,31}<>'A'` | `{0,39}=0 AND V0.N° ticket VRL/VSL<>'A'` |
| 5 | `IF(ExpCalc('4'EXP),110,36)` | `IF(ExpCalc('4'EXP),110,36)` |
| 6 | `IF({0,31}='A',MlsTrans ('Annulation'),IF({0,39}<>0,MlsTra...` | `IF(V0.N° ticket VRL/VSL='A',MlsTrans ('Annulation'),IF({0...` |
| 7 | `Trim({0,41})<>''` | `Trim({0,41})<>''` |
| 8 | `{0,42}=6` | `{0,42}=6` |
| 9 | `{0,15}` | `V0.Motif annulation` |
| 10 | `{0,1}` | `P.Devise locale` |
| 11 | `{0,61}='F'` | `{0,61}='F'` |
| 12 | `'TRUE'LOG` | `'TRUE'LOG` |
| 13 | `{0,68}` | `{0,68}` |
| 14 | `NOT {0,69}` | `NOT {0,69}` |
| 15 | `{0,5}` | `P.Date fin sejour` |
| 16 | `MlsTrans('Commentaire')&ASCIIChr (13)&MlsTrans('Commentai...` | `MlsTrans('Commentaire')&ASCIIChr (13)&MlsTrans('Commentai...` |
| 17 | `0` | `0` |
| 18 | `100` | `100` |
| 19 | `'VRL'` | `'VRL'` |
| 20 | `'FALSE'LOG` | `'FALSE'LOG` |
| 21 | `Date()<=AddDate(EOM({0,22}),0,0,1)` | `Date()<=AddDate(EOM(V0.Montant carte),0,0,1)` |
| 22 | `MlsTrans('Les IGR sont annulables jusqu''au lendemain de ...` | `MlsTrans('Les IGR sont annulables jusqu''au lendemain de ...` |
| 23 | `{0,59} AND DbRecs ('{596,4}'DSOURCE,'')>0` | `{0,59} AND DbRecs ('{596,4}'DSOURCE,'')>0` |
| 24 | `IF(Trim({0,65})<>'',Trim({0,65}),Trim({0,10}))` | `IF(Trim({0,65})<>'',Trim({0,65}),Trim(P.UNI/BI))` |
| 25 | `30` | `30` |
| 26 | `DbDel('{847,4}'DSOURCE,'')` | `DbDel('{847,4}'DSOURCE,'')` |
| 27 | `NOT {32768,78}` | `NOT VG.Hostname au lieu de Term` |
| 28 | `{32768,78}` | `VG.Hostname au lieu de Term` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{32768,79}` | `VG.Numéro pseudo terminal` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 13 (6 W / 7 R) |
| Parametres | 14 |
| Variables locales | 39 |
| Expressions | 209 |
| Expressions 100% decodees | 84 (40%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-26 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

