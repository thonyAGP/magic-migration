# ADH IDE 16 - Browse - Countries iso

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_16.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 16 |
| **Fichier XML** | Prg_16.xml |
| **Description** | Browse - Countries iso |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 2 |
| **Module** | ADH |
| **Dossier IDE** | Brazil DataCatching |

> **Note**: Ce programme est Prg_16.xml. L'ID XML (16) peut differer de la position IDE (16).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-16.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (1 tables -  en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #784 | `type_repas_nenc_vill` | type_repas_nenc_vill | **W** | 3x |

---

## 3. PARAMETRES D'ENTREE (2)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | PARAM LANGUAGE | ALPHA | - |
| P2 | PARAM COUNTRY CODE ISO | ALPHA | - |

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

> Total: 122 variables mappees

---

## 5. EXPRESSIONS (11 total, 7 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `GetParam ('LANGUAGE')<>'FRE'` | `GetParam ('LANGUAGE')<>'FRE'` |
| 2 | `GetParam ('LANGUAGE')='FRE'` | `GetParam ('LANGUAGE')='FRE'` |
| 3 | `GetParam ('LANGUAGE')='SPA'` | `GetParam ('LANGUAGE')='SPA'` |
| 1 | `CndRange ({1,2}<>'',{1,2})` | `CndRange ({1,2}<>'',{1,2})` |
| 2 | `{0,1}` | `PARAM COUNTRY CODE ISO` |
| 1 | `CndRange ({1,2}<>'',{1,2})` | `CndRange ({1,2}<>'',{1,2})` |
| 2 | `{0,1}` | `PARAM COUNTRY CODE ISO` |
| 1 | `74` | `74` |
| 2 | `75` | `75` |
| 3 | `CndRange ({1,2}<>'',{1,2})` | `CndRange ({1,2}<>'',{1,2})` |
| 4 | `{0,2}` | `{0,2}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 1 ( W / 0 R) |
| Parametres | 2 |
| Variables locales | 2 |
| Expressions | 11 |
| Expressions 100% decodees | 7 (64%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

