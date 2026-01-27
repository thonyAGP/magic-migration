# ADH IDE 45 - Recuperation langue

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_45.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 45 |
| **Fichier XML** | Prg_45.xml |
| **Description** | Recuperation langue |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 0 |
| **Module** | ADH |
| **Dossier IDE** | Divers |

> **Note**: Ce programme est Prg_45.xml. L'ID XML (45) peut differer de la position IDE (45).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-45.yaml`
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
| #740 | `pv_stockmvt_dat` | pv_stock_movements | R | 1x |

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

## 5. EXPRESSIONS (13 total, 9 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `'C'` | `'C'` |
| 2 | `{32768,1}` | `VG.USER` |
| 3 | `SetParam ('CODELANGUE',IF ({0,3}='','FRA',{0,3}))` | `SetParam ('CODELANGUE',IF ({0,3}='','FRA',{0,3}))` |
| 4 | `IF ({0,3}='','FRA',{0,3})` | `IF ({0,3}='','FRA',{0,3})` |
| 5 | `SetLang (Trim ({0,3}))` | `SetLang (Trim ({0,3}))` |
| 6 | `MnuShow ('1','TRUE'LOG)` | `MnuShow ('1','TRUE'LOG)` |
| 7 | `MnuShow ('2','TRUE'LOG)` | `MnuShow ('2','TRUE'LOG)` |
| 8 | `MnuShow ('3','TRUE'LOG)` | `MnuShow ('3','TRUE'LOG)` |
| 9 | `MnuShow ('4','TRUE'LOG)` | `MnuShow ('4','TRUE'LOG)` |
| 10 | `MnuShow ('5','TRUE'LOG)` | `MnuShow ('5','TRUE'LOG)` |
| 11 | `MnuShow ('6','TRUE'LOG)` | `MnuShow ('6','TRUE'LOG)` |
| 12 | `MnuShow ('ITRIGHT',{32768,3})` | `MnuShow ('ITRIGHT',VG.DROIT ACCES IT ?)` |
| 13 | `{0,4}` | `{0,4}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 1 (0 W /  R) |
| Parametres | 0 |
| Variables locales | 0 |
| Expressions | 13 |
| Expressions 100% decodees | 9 (69%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

