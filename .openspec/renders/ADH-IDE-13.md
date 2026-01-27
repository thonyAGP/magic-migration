# ADH IDE 13 -      calculate week #

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_13.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 13 |
| **Fichier XML** | Prg_13.xml |
| **Description** |      calculate week # |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 2 |
| **Module** | ADH |
| **Dossier IDE** | Brazil DataCatching |

> **Note**: Ce programme est Prg_13.xml. L'ID XML (13) peut differer de la position IDE (13).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-13.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (0 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|

---

## 3. PARAMETRES D'ENTREE (2)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | >.date | DATE | - |
| P2 | <.week # | NUMERIC | - |
| P3 | BOY pdate | DATE | - |
| P4 | DOW(BOY pdate) | NUMERIC | - |
| P5 | #days from BOY | NUMERIC | - |
| P6 | EOF 1st week | DATE | - |
| P7 | Days between | NUMERIC | - |
| P8 | weeks between | NUMERIC | - |

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

> Total: 134 variables mappees

---

## 5. EXPRESSIONS (7 total, 6 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `BOY ({0,1})` | `BOY (<.week #)` |
| 2 | `DOW ({0,3})` | `DOW (DOW(BOY pdate))` |
| 3 | `7-{0,4}` | `7-#days from BOY` |
| 4 | `BOY ({0,1})+{0,5}` | `BOY (<.week #)+EOF 1st week` |
| 5 | `{0,1}-{0,6}` | `<.week #-Days between` |
| 6 | `Fix (IF ({0,7} MOD 7=0,{0,7}/7,{0,7}/7+1),2,0)+1` | `Fix (IF (weeks between MOD 7=0,weeks between/7,weeks betw...` |
| 7 | `{0,8}` | `{0,8}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 0 (0 W / 0 R) |
| Parametres | 2 |
| Variables locales | 8 |
| Expressions | 7 |
| Expressions 100% decodees | 6 (86%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

