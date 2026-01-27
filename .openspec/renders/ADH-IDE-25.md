# ADH IDE 25 - Change GM

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_25.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 25 |
| **Fichier XML** | Prg_25.xml |
| **Description** | Change GM |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 16 |
| **Module** | ADH |
| **Dossier IDE** | Change |

> **Note**: Ce programme est Prg_25.xml. L'ID XML (25) peut differer de la position IDE (25).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-25.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (14 tables - 7 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #23 | `cafil001_dat` | reseau_cloture___rec | **W** | 5x |
| #44 | `cafil022_dat` | change___________chg | **W** | 4x |
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 2x |
| #68 | `cafil046_dat` | compteurs________cpt | **W** | 1x |
| #147 | `cafil125_dat` | change_vente_____chg | **W** | 4x |
| #474 | `%club_user%_caisse_compcais_devise` | comptage_caisse_devise | **W** | 3x |
| #945 | `Table_945` | Unknown | **W** | 1x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 2x |
| #35 | `cafil013_dat` | personnel_go______go | R | 1x |
| #50 | `cafil028_dat` | moyens_reglement_mor | R | 2x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 1x |
| #124 | `cafil102_dat` | type_taux_change | R | 1x |
| #139 | `cafil117_dat` | moyens_reglement_mor | R | 3x |
| #141 | `cafil119_dat` | devises__________dev | R | 1x |

---

## 3. PARAMETRES D'ENTREE (16)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | > societe | ALPHA | - |
| P2 | > code GM | NUMERIC | - |
| P3 | > filiation | NUMERIC | - |
| P4 | >devise locale | ALPHA | - |
| P5 | >nb decimale | NUMERIC | - |
| P6 | >masque mtt | ALPHA | - |
| P7 | > code retour | ALPHA | - |
| P8 | > nom village | ALPHA | - |
| P9 | > solde compte | NUMERIC | - |
| P10 | > etat compte | ALPHA | - |
| P11 | > date solde | DATE | - |
| P12 | > garanti O/N | ALPHA | - |
| P13 | > telephone | ALPHA | - |
| P14 | > fax | ALPHA | - |
| P15 | V0 choix action | ALPHA | - |
| P16 | W0 date comptable | DATE | - |
| P17 | W0 n° de change | NUMERIC | - |
| P18 | W0 date operation | DATE | - |
| P19 | W0 heure operation | TIME | - |
| P20 | W0 pas d'enreg | ALPHA | - |
| P21 | W0 user | ALPHA | - |
| P22 | W0 reseau | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| V0 choix action | ALPHA | - |
| W0 date comptable | DATE | - |
| W0 n° de change | NUMERIC | - |
| W0 date operation | DATE | - |
| W0 heure operation | TIME | - |
| W0 pas d'enreg | ALPHA | - |
| W0 user | ALPHA | - |
| W0 reseau | ALPHA | - |
| V.Code retour go ? | LOGICAL | - |
| V. titre | ALPHA | - |
| V.Type operation | ALPHA | - |

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

> Total: 180 variables mappees

---

## 5. EXPRESSIONS (285 total, 158 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,1}=''` | `> code GM=''` |
| 2 | `'C'` | `'C'` |
| 3 | `Trim ({0,34})` | `Trim ({0,34})` |
| 4 | `55` | `55` |
| 5 | `'&Quitter'` | `'&Quitter'` |
| 6 | `'&Annuler'` | `'&Annuler'` |
| 7 | `'&Creer change'` | `'&Creer change'` |
| 8 | `{0,1}` | `> code GM` |
| 9 | `{0,17}<>'F'` | `W0 date comptable<>'F'` |
| 10 | `{0,17}='F'` | `W0 date comptable='F'` |
| 11 | `{0,26}` | `Btn Annuler` |
| 12 | `{32768,1}` | `VG.USER` |
| 13 | `{0,24}<>'R'` | `V.Code retour go ?<>'R'` |
| 14 | `{0,15}='B'` | `> Nouvelle caisse='B'` |
| 15 | `'A'` | `'A'` |
| 16 | `{0,15}<>'B'` | `> Nouvelle caisse<>'B'` |
| 17 | `'F'` | `'F'` |
| 18 | `{0,36}=''` | `{0,36}=''` |
| 19 | `{0,2}` | `> filiation` |
| 20 | `{0,3}` | `>devise locale` |
| 21 | `{0,36}='A'` | `{0,36}='A'` |
| 22 | `{0,36}='V'` | `{0,36}='V'` |
| 23 | `NOT {32768,78}` | `NOT VG.Hostname au lieu de Term` |
| 24 | `{32768,78}` | `VG.Hostname au lieu de Term` |
| 1 | `{32768,2}` | `VG.Retour Chariot` |
| 2 | `Date ()` | `Date ()` |
| 3 | `Trim ({0,30})` | `Trim (V.Type operation)` |
| 4 | `89` | `89` |
| 5 | `{1,1}` | `{1,1}` |
| 6 | `{1,2}` | `{1,2}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 14 (7 W / 7 R) |
| Parametres | 16 |
| Variables locales | 31 |
| Expressions | 285 |
| Expressions 100% decodees | 158 (55%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

