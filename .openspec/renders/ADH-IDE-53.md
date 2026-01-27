# ADH IDE 53 - Extrait Easy Check Out à J+1

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_53.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 53 |
| **Fichier XML** | Prg_53.xml |
| **Description** | Extrait Easy Check Out à J+1 |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 0 |
| **Module** | ADH |
| **Dossier IDE** | Easy Check Out |

> **Note**: Ce programme est Prg_53.xml. L'ID XML (53) peut differer de la position IDE (53).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-53.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (5 tables -  en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #911 | `log_booker` | log_booker | **W** | 1x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #69 | `cafil047_dat` | initialisation___ini | R | 1x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 1x |
| #372 | `pv_budget_dat` | pv_budget | R | 1x |

---

## 3. PARAMETRES D'ENTREE (0)

| # | Nom | Type | Description |
|---|-----|------|-------------|

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| V0.DateDepart | ALPHA | - |

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

> Total: 120 variables mappees

---

## 5. EXPRESSIONS (22 total, 10 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `DStr(AddDate (Date(),0,0,1),'YYYYMMDD')` | `DStr(AddDate (Date(),0,0,1),'YYYYMMDD')` |
| 2 | `'C'` | `'C'` |
| 1 | `'TRUE'LOG` | `'TRUE'LOG` |
| 2 | `Translate('%club_exportdata%')&'Pdf\'` | `Translate('%club_exportdata%')&'Pdf\'` |
| 3 | `'EXTRAIT_ECO_'&Trim(Str({0,2},'8P0'))&'_'&Trim(Str({0,3},...` | `'EXTRAIT_ECO_'&Trim(Str({0,2},'8P0'))&'_'&Trim(Str({0,3},...` |
| 4 | `'E'` | `'E'` |
| 5 | `{0,5}<>0 AND NOT({32768,61})` | `{0,5}<>0 AND NOT(VG.Extrait de compte 1.00)` |
| 6 | `{0,5}<>0 AND {32768,61}` | `{0,5}<>0 AND VG.Extrait de compte 1.00` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{1,3}` | `{1,3}` |
| 4 | `IF({1,5}<>0,'EXTRAITECO','MAIL_ECO')` | `IF({1,5}<>0,'EXTRAITECO','MAIL_ECO')` |
| 5 | `'FALSE'LOG` | `'FALSE'LOG` |
| 6 | `{1,6}` | `{1,6}` |
| 7 | `{1,4}` | `{1,4}` |
| 8 | `Date()` | `Date()` |
| 9 | `Time()` | `Time()` |
| 10 | `'syspms@clubmed.com'` | `'syspms@clubmed.com'` |
| 11 | `IF(Trim({0,18})='3','FRA','ENG')` | `IF(Trim({0,18})='3','FRA','ENG')` |
| 12 | `{1,2}` | `{1,2}` |
| 13 | `{1,3}` | `{1,3}` |
| 14 | `'TRUE'LOG` | `'TRUE'LOG` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 5 ( W / 4 R) |
| Parametres | 0 |
| Variables locales | 1 |
| Expressions | 22 |
| Expressions 100% decodees | 10 (45%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

