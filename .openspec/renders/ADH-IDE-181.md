# ADH IDE 181 - Set Listing Number

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_180.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 181 |
| **Fichier XML** | Prg_180.xml |
| **Description** | Set Listing Number |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 1 |
| **Module** | ADH |
| **Dossier IDE** | Printer Management |

> **Note**: Ce programme est Prg_180.xml. L'ID XML (180) peut differer de la position IDE (181).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-181.yaml`
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

## 3. PARAMETRES D'ENTREE (1)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Param Listing number | NUMERIC | - |

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

> Total: 120 variables mappees

---

## 5. EXPRESSIONS (5 total, 4 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `SetParam ('CURRENTLISTINGNUM',{0,1})` | `SetParam ('CURRENTLISTINGNUM',{0,1})` |
| 2 | `SetParam ('CURRENTPRINTERNUM',0)` | `SetParam ('CURRENTPRINTERNUM',0)` |
| 3 | `SetParam ('CURRENTPRINTERNAME','VOID')` | `SetParam ('CURRENTPRINTERNAME','VOID')` |
| 4 | `SetParam ('NUMBERCOPIES',0)` | `SetParam ('NUMBERCOPIES',0)` |
| 5 | `GetParam ('SPECIFICPRINT')='VOID'` | `GetParam ('SPECIFICPRINT')='VOID'` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 0 (0 W / 0 R) |
| Parametres | 1 |
| Variables locales | 1 |
| Expressions | 5 |
| Expressions 100% decodees | 4 (80%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

