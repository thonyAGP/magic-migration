# ADH IDE 1 - Main Program

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_1.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 1 |
| **Fichier XML** | Prg_1.xml |
| **Description** | Main Program |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 1 |
| **Module** | ADH |
| **Dossier IDE** | Unknown |

> **Note**: Ce programme est Prg_1.xml. L'ID XML (1) peut differer de la position IDE (1).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-1.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (3 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #67 | `cafil045_dat` | tables___________tab | R | 1x |
| #69 | `cafil047_dat` | initialisation___ini | R | 2x |
| #372 | `pv_budget_dat` | pv_budget | R | 1x |

---

## 3. PARAMETRES D'ENTREE (1)

| # | Nom | Type | Description |
|---|-----|------|-------------|

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.Service | ALPHA | - |
| v.Service Interne ClubMed? | LOGICAL | - |

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

> Total: 329 variables mappees

---

## 5. EXPRESSIONS (94 total, 94 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `MnuShow ('Express Check-Out',{0,43})` | `MnuShow ('Express Check-Out',VG_TPE_V2.00)` |
| 2 | `RunMode ()<=2` | `RunMode ()<=2` |
| 3 | `RunMode ()<=2 OR IsComponent()` | `RunMode ()<=2 OR IsComponent()` |
| 4 | `NOT(IsComponent())` | `NOT(IsComponent())` |
| 5 | `CallProg(ProgIdx('hasRight','TRUE'LOG),{0,1},'CAISSEADH')` | `CallProg(ProgIdx('hasRight','TRUE'LOG),VG.USER,'CAISSEADH')` |
| 6 | `CallProg(ProgIdx('hasRight','TRUE'LOG),{0,1},'ACCESALL')` | `CallProg(ProgIdx('hasRight','TRUE'LOG),VG.USER,'ACCESALL')` |
| 8 | `'1.00'` | `'1.00'` |
| 9 | `'2.00'` | `'2.00'` |
| 10 | `'3.00'` | `'3.00'` |
| 11 | `'CALC.EXE'` | `'CALC.EXE'` |
| 14 | `'CA'` | `'CA'` |
| 16 | `'TAX'` | `'TAX'` |
| 17 | `'4.11'` | `'4.11'` |
| 18 | `'08/01/2026'` | `'08/01/2026'` |
| 80 | `ASCIIChr(13)&ASCIIChr(10)` | `ASCIIChr(13)&ASCIIChr(10)` |
| 19 | `'Caisse Adhérent -V '&Trim(ExpCalc('17'EXP))&' - '&Trim(E...` | `'Caisse Adhérent -V '&Trim(ExpCalc('17'EXP))&' - '&Trim(E...` |
| 21 | `'EFF'` | `'EFF'` |
| 22 | `'LEX'` | `'LEX'` |
| 23 | `'FTV'` | `'FTV'` |
| 24 | `'TPE'` | `'TPE'` |
| 25 | `'PME'` | `'PME'` |
| 26 | `'HEA'` | `'HEA'` |
| 27 | `'cmd /c mkdir '&'%club_exportdata%'&'PDF'` | `'cmd /c mkdir '&'%club_exportdata%'&'PDF'` |
| 28 | `NOT FileExist('%club_exportdata%'&'PDF')` | `NOT FileExist('%club_exportdata%'&'PDF')` |
| 29 | `Str({0,79},'8P0')` | `Str(VG.Numéro pseudo terminal,'8P0')` |
| 30 | `'I'` | `'I'` |
| 31 | `'J'` | `'J'` |
| 32 | `'VEN'` | `'VEN'` |
| 33 | `'TRA'` | `'TRA'` |
| 34 | `'FEX'` | `'FEX'` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 3 (0 W / 3 R) |
| Parametres | 1 |
| Variables locales | 118 |
| Expressions | 94 |
| Expressions 100% decodees | 94 (100%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

