# ADH IDE 179 - Get Printer

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_178.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 179 |
| **Fichier XML** | Prg_178.xml |
| **Description** | Get Printer |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 0 |
| **Module** | ADH |
| **Dossier IDE** | Printer Management |

> **Note**: Ce programme est Prg_178.xml. L'ID XML (178) peut differer de la position IDE (179).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-179.yaml`
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
| #367 | `pmsprintparamdefault` | pms_print_param_default | R | 1x |
| #369 | `presparn` | presents_par_nationalite | R | 1x |
| #370 | `pv_accountdate_dat` | pv_accounting_date | R | 2x |

---

## 3. PARAMETRES D'ENTREE (0)

| # | Nom | Type | Description |
|---|-----|------|-------------|

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.Imprimante | NUMERIC | - |
| v.Copies | NUMERIC | - |

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

> Total: 122 variables mappees

---

## 5. EXPRESSIONS (21 total, 13 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `GetParam ('CURRENTLISTINGNUM')` | `GetParam ('CURRENTLISTINGNUM')` |
| 2 | `{0,1}` | `v.Copies` |
| 3 | `SetParam ('CURRENTLISTINGNAME',IF (GetParam ('CODELANGUE'...` | `SetParam ('CURRENTLISTINGNAME',IF (GetParam ('CODELANGUE'...` |
| 4 | `SetParam ('DEFAULTPRINTERNUM',{0,1})` | `SetParam ('DEFAULTPRINTERNUM',v.Copies)` |
| 5 | `SetParam ('DEFAULTPRINTERNAME',{0,7})` | `SetParam ('DEFAULTPRINTERNAME',{0,7})` |
| 6 | `SetParam ('CURRENTPRINTERNUM',{0,1})` | `SetParam ('CURRENTPRINTERNUM',v.Copies)` |
| 7 | `SetParam ('CURRENTPRINTERNAME',{0,7})` | `SetParam ('CURRENTPRINTERNAME',{0,7})` |
| 8 | `GetParam ('CURRENTPRINTERNUM')=0` | `GetParam ('CURRENTPRINTERNUM')=0` |
| 9 | `GetParam ('CURRENTPRINTERNAME')='VOID'` | `GetParam ('CURRENTPRINTERNAME')='VOID'` |
| 10 | `SetParam ('NUMBERCOPIES',{0,2})` | `SetParam ('NUMBERCOPIES',{0,2})` |
| 11 | `GetParam ('NUMBERCOPIES')=0` | `GetParam ('NUMBERCOPIES')=0` |
| 12 | `NOT {32768,78}` | `NOT VG.Hostname au lieu de Term` |
| 13 | `{32768,78}` | `VG.Hostname au lieu de Term` |
| 1 | `{32768,79}` | `VG.Numéro pseudo terminal` |
| 2 | `GetParam ('CURRENTLISTINGNUM')` | `GetParam ('CURRENTLISTINGNUM')` |
| 3 | `{0,3}` | `{0,3}` |
| 4 | `{0,4}` | `{0,4}` |
| 1 | `GetHostName()` | `GetHostName()` |
| 2 | `GetParam ('CURRENTLISTINGNUM')` | `GetParam ('CURRENTLISTINGNUM')` |
| 3 | `{0,3}` | `{0,3}` |
| 4 | `{0,4}` | `{0,4}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 3 (0 W / 3 R) |
| Parametres | 0 |
| Variables locales | 2 |
| Expressions | 21 |
| Expressions 100% decodees | 13 (62%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

