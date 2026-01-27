# ADH IDE 10 - Print list Checkout (shift F9)

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_10.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 10 |
| **Fichier XML** | Prg_10.xml |
| **Description** | Print list Checkout (shift F9) |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 0 |
| **Module** | ADH |
| **Dossier IDE** | Brazil DataCatching |

> **Note**: Ce programme est Prg_10.xml. L'ID XML (10) peut differer de la position IDE (10).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-10.yaml`
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
| #47 | `cafil025_dat` | compte_gm________cgm | R | 1x |

---

## 3. PARAMETRES D'ENTREE (0)

| # | Nom | Type | Description |
|---|-----|------|-------------|

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

> Total: 118 variables mappees

---

## 5. EXPRESSIONS (23 total, 21 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `SetCrsr (1)` | `SetCrsr (1)` |
| 2 | `SetCrsr (2)` | `SetCrsr (2)` |
| 1 | `SetParam ('CURRENTPAGENUMBER',0)` | `SetParam ('CURRENTPAGENUMBER',0)` |
| 1 | `{32768,44}` | `VG.VG_FAX_VISIBLE` |
| 2 | `'C'` | `'C'` |
| 3 | `'K'` | `'K'` |
| 4 | `{0,1}+{0,8}` | `{0,1}+{0,8}` |
| 5 | `Date ()` | `Date ()` |
| 6 | `Time ()` | `Time ()` |
| 7 | `{0,5}` | `{0,5}` |
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
| 18 | `'Page '&Trim (Str (Page (0,1),'3'))&'/'&Trim (Str (1*GetP...` | `'Page '&Trim (Str (Page (0,1),'3'))&'/'&Trim (Str (1*GetP...` |
| 19 | `{32768,2}` | `VG.Retour Chariot` |
| 20 | `INIGet ('[MAGIC_LOGICAL_NAMES]preview')='O'` | `INIGet ('[MAGIC_LOGICAL_NAMES]preview')='O'` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 1 (0 W /  R) |
| Parametres | 0 |
| Variables locales | 0 |
| Expressions | 23 |
| Expressions 100% decodees | 21 (91%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

