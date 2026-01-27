# ADH IDE 87 -     Print Plafonds alloués

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_87.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 87 |
| **Fichier XML** | Prg_87.xml |
| **Description** |     Print Plafonds alloués |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 5 |
| **Module** | ADH |
| **Dossier IDE** | EzCard |

> **Note**: Ce programme est Prg_87.xml. L'ID XML (87) peut differer de la position IDE (87).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-87.yaml`
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
| #19 | `bldetail` | bl_detail | R | 7x |
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 7x |
| #69 | `cafil047_dat` | initialisation___ini | R | 1x |
| #312 | `ezcard` | ez_card | R | 7x |

---

## 3. PARAMETRES D'ENTREE (5)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0 societe | ALPHA | - |
| P2 | P0 code adherent | NUMERIC | - |
| P3 | P0 filiation | NUMERIC | - |
| P4 | P0 masque montant | ALPHA | - |
| P5 | P0 masque cumul | ALPHA | - |
| P6 | W0 nom village | ALPHA | - |
| P7 | W0 nom | ALPHA | - |
| P8 | W0 prenom | ALPHA | - |
| P9 | W0 titre | ALPHA | - |
| P10 | W0 n° adherent | NUMERIC | - |
| P11 | W0 lettre contrôle | ALPHA | - |
| P12 | W0 filiation | NUMERIC | - |
| P13 | W0 langue parlee | ALPHA | - |
| P14 | W0 devise locale | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0 nom village | ALPHA | - |
| W0 nom | ALPHA | - |
| W0 prenom | ALPHA | - |
| W0 titre | ALPHA | - |
| W0 n° adherent | NUMERIC | - |
| W0 lettre contrôle | ALPHA | - |
| W0 filiation | NUMERIC | - |
| W0 langue parlee | ALPHA | - |
| W0 devise locale | ALPHA | - |

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

> Total: 146 variables mappees

---

## 5. EXPRESSIONS (194 total, 154 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `SetCrsr (1)` | `SetCrsr (1)` |
| 2 | `SetCrsr (2)` | `SetCrsr (2)` |
| 3 | `GetParam ('CURRENTPRINTERNUM')=1` | `GetParam ('CURRENTPRINTERNUM')=1` |
| 4 | `GetParam ('CURRENTPRINTERNUM')=4` | `GetParam ('CURRENTPRINTERNUM')=4` |
| 5 | `GetParam ('CURRENTPRINTERNUM')=5` | `GetParam ('CURRENTPRINTERNUM')=5` |
| 6 | `GetParam ('CURRENTPRINTERNUM')=8` | `GetParam ('CURRENTPRINTERNUM')=8` |
| 7 | `GetParam ('CURRENTPRINTERNUM')=9` | `GetParam ('CURRENTPRINTERNUM')=9` |
| 8 | `'TRUE'LOG` | `'TRUE'LOG` |
| 1 | `{0,2}` | `P0 filiation` |
| 1 | `Counter (0)>=GetParam ('NUMBERCOPIES')` | `Counter (0)>=GetParam ('NUMBERCOPIES')` |
| 2 | `SetParam ('CURRENTPAGENUMBER',0)` | `SetParam ('CURRENTPAGENUMBER',0)` |
| 1 | `{32768,44}` | `VG.VG_FAX_VISIBLE` |
| 2 | `{2,1}` | `{2,1}` |
| 3 | `{2,2}` | `{2,2}` |
| 4 | `{2,3}` | `{2,3}` |
| 5 | `{2,4}` | `{2,4}` |
| 6 | `{2,5}` | `{2,5}` |
| 7 | `{0,1}+{0,6}` | `P0 code adherent+W0 nom` |
| 8 | `GetParam ('VI_CLUB')` | `GetParam ('VI_CLUB')` |
| 9 | `GetParam ('VI_NAME')` | `GetParam ('VI_NAME')` |
| 10 | `GetParam ('VI_ADR1')` | `GetParam ('VI_ADR1')` |
| 11 | `GetParam ('VI_ADR2')` | `GetParam ('VI_ADR2')` |
| 12 | `GetParam ('VI_ZIPC')` | `GetParam ('VI_ZIPC')` |
| 13 | `GetParam ('VI_PHON')` | `GetParam ('VI_PHON')` |
| 14 | `GetParam ('VI_FAXN')` | `GetParam ('VI_FAXN')` |
| 15 | `GetParam ('VI_MAIL')` | `GetParam ('VI_MAIL')` |
| 16 | `GetParam ('VI_SIRE')` | `GetParam ('VI_SIRE')` |
| 17 | `GetParam ('VI_VATN')` | `GetParam ('VI_VATN')` |
| 18 | `Date ()` | `Date ()` |
| 19 | `Time ()` | `Time ()` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 4 (0 W / 4 R) |
| Parametres | 5 |
| Variables locales | 14 |
| Expressions | 194 |
| Expressions 100% decodees | 154 (79%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

