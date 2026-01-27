# ADH IDE 116 - Calcul concurrence sessions

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_116.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 116 |
| **Fichier XML** | Prg_116.xml |
| **Description** | Calcul concurrence sessions |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 2 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_116.xml. L'ID XML (116) peut differer de la position IDE (116).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-116.yaml`
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
| #227 | `caisse_concurrences` | concurrence_sessions | **W** | 5x |

---

## 3. PARAMETRES D'ENTREE (2)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | PI code calcul | ALPHA | - |
| P2 | PO coffre en cours comptage | ALPHA | - |
| P3 | coffre en cours comptage | LOGICAL | - |

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

> Total: 124 variables mappees

---

## 5. EXPRESSIONS (27 total, 25 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,1}='C'` | `PO coffre en cours comptage='C'` |
| 2 | `{0,1}='D'` | `PO coffre en cours comptage='D'` |
| 3 | `'C'` | `'C'` |
| 4 | `'O'` | `'O'` |
| 5 | `'O'` | `'O'` |
| 6 | `{0,3}` | `{0,3}` |
| 7 | `NOT ({0,3})` | `NOT ({0,3})` |
| 8 | `NOT {32768,78}` | `NOT VG.Hostname au lieu de Term` |
| 9 | `{32768,78}` | `VG.Hostname au lieu de Term` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `'R'` | `'R'` |
| 3 | `'O'` | `'O'` |
| 4 | `{32768,79}` | `VG.Numéro pseudo terminal` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `'R'` | `'R'` |
| 3 | `'O'` | `'O'` |
| 4 | `0` | `0` |
| 5 | `GetHostName ()` | `GetHostName ()` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `'R'` | `'R'` |
| 3 | `'N'` | `'N'` |
| 4 | `{32768,79}` | `VG.Numéro pseudo terminal` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `'R'` | `'R'` |
| 3 | `'N'` | `'N'` |
| 4 | `0` | `0` |
| 5 | `GetHostName ()` | `GetHostName ()` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 1 ( W / 0 R) |
| Parametres | 2 |
| Variables locales | 3 |
| Expressions | 27 |
| Expressions 100% decodees | 25 (93%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

