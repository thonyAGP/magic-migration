# ADH IDE 12 - Catching stats

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_12.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 12 |
| **Fichier XML** | Prg_12.xml |
| **Description** | Catching stats |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 0 |
| **Module** | ADH |
| **Dossier IDE** | Brazil DataCatching |

> **Note**: Ce programme est Prg_12.xml. L'ID XML (12) peut differer de la position IDE (12).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-12.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (4 tables - 2 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #22 | `cafil_address_ec` | address_data_catching | **W** | 2x |
| #782 | `quadriga_chambre` | quadriga_chambre | **W** | 1x |
| #69 | `cafil047_dat` | initialisation___ini | R | 1x |
| #781 | `log_affec_auto_entete` | log_affec_auto_entete | R | 1x |

---

## 3. PARAMETRES D'ENTREE (0)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | v.no exit | LOGICAL | - |
| P2 | v.date init | DATE | - |
| P3 | v.BOM(date init) | DATE | - |
| P4 | v.DOW(BOM(date init)) | NUMERIC | - |
| P5 | v.date 1st row init | DATE | - |
| P6 | v.week nb init | NUMERIC | - |
| P7 | v.DayWeekMonth | ALPHA | - |
| P8 | v.date from | DATE | - |
| P9 | v.date to | DATE | - |
| P10 | v1.email only ? | LOGICAL | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.no exit | LOGICAL | - |
| v.date init | DATE | - |
| v.BOM(date init) | DATE | - |
| v.DOW(BOM(date init)) | NUMERIC | - |
| v.date 1st row init | DATE | - |
| v.week nb init | NUMERIC | - |
| v.DayWeekMonth | ALPHA | - |
| v.date from | DATE | - |
| v.date to | DATE | - |

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

> Total: 138 variables mappees

---

## 5. EXPRESSIONS (139 total, 36 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `NOT ({0,1})` | `NOT (v.date init)` |
| 2 | `'FALSE'LOG` | `'FALSE'LOG` |
| 3 | `BOM ({0,2})` | `BOM (v.BOM(date init))` |
| 4 | `DOW ({0,3})` | `DOW (v.DOW(BOM(date init)))` |
| 5 | `AddDate ({0,3},0,0,1-{0,4})` | `AddDate (v.DOW(BOM(date init)),0,0,1-v.date 1st row init)` |
| 6 | `Date ()` | `Date ()` |
| 7 | `BOM ({0,2})` | `BOM (v.BOM(date init))` |
| 8 | `IF ({0,9}-{0,8}=0,'D',IF ({0,9}-{0,8}=6,'W','M'))` | `IF (v1.email only ?-v.date to=0,'D',IF (v1.email only ?-v...` |
| 9 | `IF (LastClicked ()<>'MANUALY',IF ({0,7}='D',{0,8},IF ({0,...` | `IF (LastClicked ()<>'MANUALY',IF (v.date from='D',v.date ...` |
| 1 | `'TRUE'LOG` | `'TRUE'LOG` |
| 2 | `{1,8}` | `{1,8}` |
| 3 | `{1,9}` | `{1,9}` |
| 4 | `CMonth ({1,2})` | `CMonth ({1,2})` |
| 5 | `Month ({1,2})` | `Month ({1,2})` |
| 6 | `Trim (Str ({1,6},'2'))` | `Trim (Str ({1,6},'2'))` |
| 7 | `Trim (Str ({1,6}+1,'2'))` | `Trim (Str ({1,6}+1,'2'))` |
| 8 | `Trim (Str ({1,6}+2,'2'))` | `Trim (Str ({1,6}+2,'2'))` |
| 9 | `Trim (Str ({1,6}+3,'2'))` | `Trim (Str ({1,6}+3,'2'))` |
| 10 | `Trim (Str ({1,6}+4,'2'))` | `Trim (Str ({1,6}+4,'2'))` |
| 11 | `Trim (Str ({1,6}+5,'2'))` | `Trim (Str ({1,6}+5,'2'))` |
| 12 | `Str (Day (AddDate ({1,5},0,0,0)),'2')` | `Str (Day (AddDate ({1,5},0,0,0)),'2')` |
| 13 | `Str (Day (AddDate ({1,5},0,0,1)),'2')` | `Str (Day (AddDate ({1,5},0,0,1)),'2')` |
| 14 | `Str (Day (AddDate ({1,5},0,0,2)),'2')` | `Str (Day (AddDate ({1,5},0,0,2)),'2')` |
| 15 | `Str (Day (AddDate ({1,5},0,0,3)),'2')` | `Str (Day (AddDate ({1,5},0,0,3)),'2')` |
| 16 | `Str (Day (AddDate ({1,5},0,0,4)),'2')` | `Str (Day (AddDate ({1,5},0,0,4)),'2')` |
| 17 | `Str (Day (AddDate ({1,5},0,0,5)),'2')` | `Str (Day (AddDate ({1,5},0,0,5)),'2')` |
| 18 | `Str (Day (AddDate ({1,5},0,0,6)),'2')` | `Str (Day (AddDate ({1,5},0,0,6)),'2')` |
| 19 | `Str (Day (AddDate ({1,5},0,0,7)),'2')` | `Str (Day (AddDate ({1,5},0,0,7)),'2')` |
| 20 | `Str (Day (AddDate ({1,5},0,0,8)),'2')` | `Str (Day (AddDate ({1,5},0,0,8)),'2')` |
| 21 | `Str (Day (AddDate ({1,5},0,0,9)),'2')` | `Str (Day (AddDate ({1,5},0,0,9)),'2')` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 4 (2 W / 2 R) |
| Parametres | 0 |
| Variables locales | 10 |
| Expressions | 139 |
| Expressions 100% decodees | 36 (26%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

