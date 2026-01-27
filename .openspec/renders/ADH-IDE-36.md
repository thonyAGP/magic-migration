# ADH IDE 36 - Print Separation ou fusion

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_36.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 36 |
| **Fichier XML** | Prg_36.xml |
| **Description** | Print Separation ou fusion |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 13 |
| **Module** | ADH |
| **Dossier IDE** | Changement Compte |

> **Note**: Ce programme est Prg_36.xml. L'ID XML (36) peut differer de la position IDE (36).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-36.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (4 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 1x |
| #40 | `cafil018_dat` | comptable________cte | R | 10x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 1x |
| #343 | `histo_fus_sep_saisie` | histo_fusionseparation_saisie | R | 11x |

---

## 3. PARAMETRES D'ENTREE (13)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0 societe | ALPHA | - |
| P2 | P0 code GM | NUMERIC | - |
| P3 | P0 filiation | NUMERIC | - |
| P4 | P0 masque montant | ALPHA | - |
| P5 | P0 garantie | ALPHA | - |
| P6 | P0 solde | NUMERIC | - |
| P7 | P0 date limite solde | DATE | - |
| P8 | P0 nom village | ALPHA | - |
| P9 | P0 Uni/Bilateral | ALPHA | - |
| P10 | P0 n° compteur | NUMERIC | - |
| P11 | P0 MERGE/SEPAR | ALPHA | - |
| P12 | P0 SEPAR NNN/ONE | ALPHA | - |
| P13 | P0 chrono F/E | NUMERIC | - |
| P14 | W0 nbre filiation | NUMERIC | - |
| P15 | W0 date operation | DATE | - |
| P16 | W0 heure operation | TIME | - |
| P17 | W0 nom/prenom newcpt | ALPHA | - |
| P18 | W0 qualite compte | ALPHA | - |
| P19 | W0 Nbre Record Histo | NUMERIC | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0 nbre filiation | NUMERIC | - |
| W0 date operation | DATE | - |
| W0 heure operation | TIME | - |
| W0 nom/prenom newcpt | ALPHA | - |
| W0 qualite compte | ALPHA | - |
| W0 Nbre Record Histo | NUMERIC | - |

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

> Total: 156 variables mappees

---

## 5. EXPRESSIONS (396 total, 278 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,1}=''` | `P0 code GM=''` |
| 2 | `'C'` | `'C'` |
| 3 | `{0,1}` | `P0 code GM` |
| 4 | `Date ()` | `Date ()` |
| 5 | `Time ()` | `Time ()` |
| 6 | `{0,2}` | `P0 filiation` |
| 7 | `{0,3}` | `P0 masque montant` |
| 8 | `SetCrsr (2)` | `SetCrsr (2)` |
| 9 | `SetCrsr (1)` | `SetCrsr (1)` |
| 10 | `GetParam ('CURRENTPRINTERNUM')=1` | `GetParam ('CURRENTPRINTERNUM')=1` |
| 11 | `GetParam ('CURRENTPRINTERNUM')=4` | `GetParam ('CURRENTPRINTERNUM')=4` |
| 12 | `GetParam ('CURRENTPRINTERNUM')=6` | `GetParam ('CURRENTPRINTERNUM')=6` |
| 13 | `GetParam ('CURRENTPRINTERNUM')=8` | `GetParam ('CURRENTPRINTERNUM')=8` |
| 14 | `GetParam ('CURRENTPRINTERNUM')=9` | `GetParam ('CURRENTPRINTERNUM')=9` |
| 15 | `'TRUE'LOG` | `'TRUE'LOG` |
| 1 | `0` | `0` |
| 2 | `{1,13}` | `{1,13}` |
| 3 | `{1,19}+1` | `{1,19}+1` |
| 1 | `Counter (0)>=GetParam ('NUMBERCOPIES')` | `Counter (0)>=GetParam ('NUMBERCOPIES')` |
| 2 | `SetParam ('CURRENTPAGENUMBER',0)` | `SetParam ('CURRENTPAGENUMBER',0)` |
| 1 | `{32768,44}` | `VG.VG_FAX_VISIBLE` |
| 2 | `IF ({2,11}='MERGE',MlsTrans ('Fusion de comptes'),MlsTran...` | `IF ({2,11}='MERGE',MlsTrans ('Fusion de comptes'),MlsTran...` |
| 3 | `{0,9}=0` | `P0 n° compteur=0` |
| 4 | `RTrim ({0,5})&' '&RTrim ({0,6})` | `RTrim (P0 solde)&' '&RTrim (P0 date limite solde)` |
| 5 | `{2,13}` | `{2,13}` |
| 6 | `0` | `0` |
| 7 | `{0,9}<={2,14}-1` | `P0 n° compteur<={2,14}-1` |
| 8 | `{0,9}+1` | `P0 n° compteur+1` |
| 9 | `GetParam ('VI_CLUB')` | `GetParam ('VI_CLUB')` |
| 10 | `GetParam ('VI_NAME')` | `GetParam ('VI_NAME')` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 4 (0 W / 4 R) |
| Parametres | 13 |
| Variables locales | 19 |
| Expressions | 396 |
| Expressions 100% decodees | 278 (70%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

