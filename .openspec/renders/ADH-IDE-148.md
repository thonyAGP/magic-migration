# ADH IDE 148 - Devises RAZ WS

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_148.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 148 |
| **Fichier XML** | Prg_148.xml |
| **Description** | Devises RAZ WS |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 5 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_148.xml. L'ID XML (148) peut differer de la position IDE (148).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-148.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (3 tables -  en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #232 | `caisse_devise` | gestion_devise_session | **W** | 2x |
| #50 | `cafil028_dat` | moyens_reglement_mor | R | 1x |
| #139 | `cafil117_dat` | moyens_reglement_mor | R | 1x |

---

## 3. PARAMETRES D'ENTREE (5)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Param societe | ALPHA | - |
| P2 | Param devise locale | ALPHA | - |
| P3 | Param quand | ALPHA | - |
| P4 | Param type | ALPHA | - |
| P5 | Param UNI/BI | ALPHA | - |

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

> Total: 128 variables mappees

---

## 5. EXPRESSIONS (21 total, 12 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,5}<>'B'` | `{0,5}<>'B'` |
| 2 | `{0,5}='B'` | `{0,5}='B'` |
| 1 | `{0,1}` | `Param devise locale` |
| 2 | `{32768,1}` | `VG.USER` |
| 3 | `{0,6}` | `{0,6}` |
| 4 | `{0,8}` | `{0,8}` |
| 5 | `{0,3}` | `Param type` |
| 6 | `{0,4}` | `Param UNI/BI` |
| 7 | `{0,6}<>{0,2}` | `{0,6}<>Param quand` |
| 8 | `0` | `0` |
| 1 | `{0,1}` | `Param devise locale` |
| 2 | `'O'` | `'O'` |
| 3 | `0` | `0` |
| 4 | `{32768,1}` | `VG.USER` |
| 5 | `{0,6}` | `{0,6}` |
| 6 | `{0,8}` | `{0,8}` |
| 7 | `{0,3}` | `Param type` |
| 8 | `{0,4}` | `Param UNI/BI` |
| 9 | `{0,6}<>{0,2}` | `{0,6}<>Param quand` |
| 10 | `0` | `0` |
| 11 | `{0,6}&{0,8}` | `{0,6}&{0,8}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 3 ( W / 2 R) |
| Parametres | 5 |
| Variables locales | 5 |
| Expressions | 21 |
| Expressions 100% decodees | 12 (57%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

