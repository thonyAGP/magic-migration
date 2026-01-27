# ADH IDE 112 - Garantie sur compte PMS-584

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_112.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 112 |
| **Fichier XML** | Prg_112.xml |
| **Description** | Garantie sur compte PMS-584 |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 17 |
| **Module** | ADH |
| **Dossier IDE** | Garantie |

> **Note**: Ce programme est Prg_112.xml. L'ID XML (112) peut differer de la position IDE (112).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-112.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (22 tables - 11 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #31 | `cafil009_dat` | gm-complet_______gmc | **W** | 4x |
| #39 | `cafil017_dat` | depot_garantie___dga | **W** | 6x |
| #40 | `cafil018_dat` | comptable________cte | **W** | 2x |
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 7x |
| #68 | `cafil046_dat` | compteurs________cpt | **W** | 2x |
| #88 | `cafil066_dat` | historik_station | **W** | 2x |
| #285 | `email` | email | **W** | 2x |
| #312 | `ezcard` | ez_card | **W** | 1x |
| #370 | `pv_accountdate_dat` | pv_accounting_date | **W** | 2x |
| #911 | `log_booker` | log_booker | **W** | 2x |
| #945 | `Table_945` | Unknown | **W** | 2x |
| #23 | `cafil001_dat` | reseau_cloture___rec | R | 2x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 2x |
| #50 | `cafil028_dat` | moyens_reglement_mor | R | 1x |
| #66 | `cafil044_dat` | imputations______imp | R | 2x |
| #69 | `cafil047_dat` | initialisation___ini | R | 2x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 2x |
| #89 | `cafil067_dat` | moyen_paiement___mop | R | 1x |
| #91 | `cafil069_dat` | garantie_________gar | R | 5x |
| #139 | `cafil117_dat` | moyens_reglement_mor | R | 1x |
| #140 | `cafil118_dat` | moyen_paiement___mop | R | 1x |
| #910 | `classification_memory` | classification_memory | R | 1x |

---

## 3. PARAMETRES D'ENTREE (17)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | > societe | ALPHA | - |
| P2 | > code adherent | NUMERIC | - |
| P3 | > filiation | NUMERIC | - |
| P4 | > devise locale | ALPHA | - |
| P5 | > nb decimale | NUMERIC | - |
| P6 | > masque montant | ALPHA | - |
| P7 | > village à CAM | ALPHA | - |
| P8 | > flag depot | ALPHA | - |
| P9 | > code retour | ALPHA | - |
| P10 | > nom village | ALPHA | - |
| P11 | > solde compte | NUMERIC | - |
| P12 | > etat compte | ALPHA | - |
| P13 | > date solde | DATE | - |
| P14 | > change uni/bi ? | ALPHA | - |
| P15 | > choix garantie | ALPHA | - |
| P16 | W0 reseau | ALPHA | - |
| P17 | W0 fin tache | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0 reseau | ALPHA | - |
| W0 fin tache | ALPHA | - |
| V.Création Garantie | LOGICAL | - |
| v.TPE ICMP ? | LOGICAL | - |
| v.Session caisse ouverte? | LOGICAL | - |

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

> Total: 162 variables mappees

---

## 5. EXPRESSIONS (538 total, 301 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,1}=''` | `> code adherent=''` |
| 2 | `'C'` | `'C'` |
| 3 | `{0,18}<>'R' AND {0,14}<>'B'` | `W0 fin tache<>'R' AND > choix garantie<>'B'` |
| 4 | `{0,18}<>'R' AND {0,14}='B'` | `W0 fin tache<>'R' AND > choix garantie='B'` |
| 5 | `'F'` | `'F'` |
| 6 | `{0,19}='F'` | `V.Création Garantie='F'` |
| 7 | `''` | `''` |
| 8 | `{0,20} AND {32768,64}` | `v.TPE ICMP ? AND VG.Prise de Garantie V2.00` |
| 9 | `CallProg('{323,-1}'PROG)` | `CallProg('{323,-1}'PROG)` |
| 10 | `NOT({0,22}) AND NOT({32768,3})` | `NOT({0,22}) AND NOT(VG.DROIT ACCES IT ?)` |
| 1 | `{0,3}<>'S'` | `> devise locale<>'S'` |
| 2 | `{1,1}` | `{1,1}` |
| 3 | `{1,2}` | `{1,2}` |
| 4 | `{0,3}` | `> devise locale` |
| 5 | `{1,18}='R'` | `{1,18}='R'` |
| 6 | `{1,18}<>'R'` | `{1,18}<>'R'` |
| 7 | `'R'` | `'R'` |
| 1 | `MlsTrans ('Nombre de carte(s) à recuperer')&' : '&Trim (S...` | `MlsTrans ('Nombre de carte(s) à recuperer')&' : '&Trim (S...` |
| 2 | `17` | `17` |
| 3 | `Trim ({0,47})` | `Trim ({0,47})` |
| 4 | `{32768,43}` | `VG.VG_TPE_V2.00` |
| 5 | `Trim({0,27})='$CARD'` | `Trim({0,27})='$CARD'` |
| 6 | `{1,2}` | `{1,2}` |
| 7 | `{1,3}` | `{1,3}` |
| 8 | `{32768,82}<>'TB'` | `VG.VG SUPPORT (Tablette,WorkStatio<>'TB'` |
| 9 | `{0,18}` | `W0 fin tache` |
| 10 | `Trim({0,38})` | `Trim({0,38})` |
| 11 | `Trim({0,62})=''` | `Trim({0,62})=''` |
| 12 | `Trim({0,62})<>'' AND {32768,43}` | `Trim({0,62})<>'' AND VG.VG_TPE_V2.00` |
| 13 | `{0,19}<>6` | `V.Création Garantie<>6` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 22 (11 W / 11 R) |
| Parametres | 17 |
| Variables locales | 22 |
| Expressions | 538 |
| Expressions 100% decodees | 301 (56%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

