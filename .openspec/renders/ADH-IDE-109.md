# ADH IDE 109 - Print creation garantie TIK V1

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_109.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 109 |
| **Fichier XML** | Prg_109.xml |
| **Description** | Print creation garantie TIK V1 |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 5 |
| **Module** | ADH |
| **Dossier IDE** | Garantie |

> **Note**: Ce programme est Prg_109.xml. L'ID XML (109) peut differer de la position IDE (109).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-109.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (7 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 1x |
| #34 | `cafil012_dat` | hebergement______heb | R | 1x |
| #39 | `cafil017_dat` | depot_garantie___dga | R | 7x |
| #91 | `cafil069_dat` | garantie_________gar | R | 7x |
| #368 | `pmsvillage` | pms_village | R | 1x |
| #818 | `zcircafil146` | Circuit supprime | R | 1x |

---

## 3. PARAMETRES D'ENTREE (5)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0 societe | ALPHA | - |
| P2 | P0 code adherent | NUMERIC | - |
| P3 | P0 filiation | NUMERIC | - |
| P4 | P0 nom village | ALPHA | - |
| P5 | P0 masque montant | ALPHA | - |
| P6 | W0 nom | ALPHA | - |
| P7 | W0 prenom | ALPHA | - |
| P8 | W0 n° adherent | NUMERIC | - |
| P9 | W0 lettre contrôle | ALPHA | - |
| P10 | W0 filiation | NUMERIC | - |
| P11 | v.comment | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0 nom | ALPHA | - |
| W0 prenom | ALPHA | - |
| W0 n° adherent | NUMERIC | - |
| W0 lettre contrôle | ALPHA | - |
| W0 filiation | NUMERIC | - |
| W0 Chambre | ALPHA | - |
| W0 date de debut | DATE | - |
| W0 date de fin | DATE | - |
| v.comment | ALPHA | - |

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

## 5. EXPRESSIONS (180 total, 120 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `SetCrsr (2)` | `SetCrsr (2)` |
| 2 | `GetParam ('CURRENTLISTINGNUM')` | `GetParam ('CURRENTLISTINGNUM')` |
| 3 | `Trim ({0,15})&' '&Trim ({0,16})&' '&Trim ({0,17})` | `Trim ({0,15})&' '&Trim ({0,16})&' '&Trim ({0,17})` |
| 4 | `SetCrsr (1)` | `SetCrsr (1)` |
| 5 | `GetParam ('CURRENTPRINTERNUM')=1` | `GetParam ('CURRENTPRINTERNUM')=1` |
| 6 | `GetParam ('CURRENTPRINTERNUM')=4` | `GetParam ('CURRENTPRINTERNUM')=4` |
| 7 | `GetParam ('CURRENTPRINTERNUM')=5` | `GetParam ('CURRENTPRINTERNUM')=5` |
| 8 | `GetParam ('CURRENTPRINTERNUM')=8` | `GetParam ('CURRENTPRINTERNUM')=8` |
| 9 | `GetParam ('CURRENTPRINTERNUM')=9` | `GetParam ('CURRENTPRINTERNUM')=9` |
| 10 | `'GL1'` | `'GL1'` |
| 11 | `'GL2'` | `'GL2'` |
| 12 | `'TRUE'LOG` | `'TRUE'LOG` |
| 1 | `SetParam ('CURRENTPAGENUMBER',0)` | `SetParam ('CURRENTPAGENUMBER',0)` |
| 2 | `Counter (0)>=GetParam ('NUMBERCOPIES')` | `Counter (0)>=GetParam ('NUMBERCOPIES')` |
| 1 | `'CLUB MED '&Upper(GetParam ('VI_CLUB'))` | `'CLUB MED '&Upper(GetParam ('VI_CLUB'))` |
| 2 | `GetParam ('VI_NAME')` | `GetParam ('VI_NAME')` |
| 3 | `GetParam ('VI_ADR1')` | `GetParam ('VI_ADR1')` |
| 4 | `GetParam ('VI_ADR2')` | `GetParam ('VI_ADR2')` |
| 5 | `GetParam ('VI_ZIPC')` | `GetParam ('VI_ZIPC')` |
| 6 | `'Tel/Phone: '&GetParam ('VI_PHON')` | `'Tel/Phone: '&GetParam ('VI_PHON')` |
| 7 | `'Email: '&GetParam ('VI_FAXN')` | `'Email: '&GetParam ('VI_FAXN')` |
| 8 | `GetParam ('VI_MAIL')` | `GetParam ('VI_MAIL')` |
| 9 | `GetParam ('VI_SIRE')` | `GetParam ('VI_SIRE')` |
| 10 | `GetParam ('VI_VATN')` | `GetParam ('VI_VATN')` |
| 11 | `{2,1}` | `{2,1}` |
| 12 | `{2,2}` | `{2,2}` |
| 13 | `{0,9}` | `W0 filiation` |
| 14 | `{2,5}` | `{2,5}` |
| 15 | `Date ()` | `Date ()` |
| 16 | `Time ()` | `Time ()` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 7 (0 W / 7 R) |
| Parametres | 5 |
| Variables locales | 14 |
| Expressions | 180 |
| Expressions 100% decodees | 120 (67%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

