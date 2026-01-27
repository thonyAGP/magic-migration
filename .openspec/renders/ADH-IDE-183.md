# ADH IDE 183 - Other Listing

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_182.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 183 |
| **Fichier XML** | Prg_182.xml |
| **Description** | Other Listing |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 0 |
| **Module** | ADH |
| **Dossier IDE** | Printer Management |

> **Note**: Ce programme est Prg_182.xml. L'ID XML (182) peut differer de la position IDE (183).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-183.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (1 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #367 | `pmsprintparamdefault` | pms_print_param_default | R | 1x |

---

## 3. PARAMETRES D'ENTREE (0)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | ChoosenListingWithPrinterButton | ALPHA | - |
| P2 | AskedListing | ALPHA | - |
| P3 | Choice again parameters | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|

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

> Total: 124 variables mappees

---

## 5. EXPRESSIONS (6 total, 5 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `GetParam ('ASKEDLISTINGNUM')` | `GetParam ('ASKEDLISTINGNUM')` |
| 2 | `'Choice again'` | `'Choice again'` |
| 1 | `1*GetParam ('ASKEDLISTINGNUM')` | `1*GetParam ('ASKEDLISTINGNUM')` |
| 2 | `1*GetParam ('LISTINGNUMPRINTERCHOICE')` | `1*GetParam ('LISTINGNUMPRINTERCHOICE')` |
| 3 | `{0,2}` | `Choice again parameters` |
| 4 | `{0,5}` | `{0,5}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 1 (0 W /  R) |
| Parametres | 0 |
| Variables locales | 3 |
| Expressions | 6 |
| Expressions 100% decodees | 5 (83%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

