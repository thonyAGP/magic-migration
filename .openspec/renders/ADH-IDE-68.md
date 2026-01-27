# ADH IDE 68 -  Saisie date

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_68.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 68 |
| **Fichier XML** | Prg_68.xml |
| **Description** |  Saisie date |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 3 |
| **Module** | ADH |
| **Dossier IDE** | Extrait de Compte |

> **Note**: Ce programme est Prg_68.xml. L'ID XML (68) peut differer de la position IDE (68).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-68.yaml`
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

## 3. PARAMETRES D'ENTREE (3)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | > date comptable | DATE | - |
| P2 | < date min | DATE | - |
| P3 | < date max | DATE | - |
| P4 | v.date Min | DATE | - |
| P5 | v.date Max | DATE | - |
| P6 | v. ok | LOGICAL | - |
| P7 | Bouton Ok | ALPHA | - |
| P8 | v.titre | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.date Min | DATE | - |
| v.date Max | DATE | - |
| v. ok | LOGICAL | - |
| v.titre | ALPHA | - |

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

## 5. EXPRESSIONS (10 total, 9 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,1}` | `< date min` |
| 2 | `Trim ({0,8})` | `Trim ({0,8})` |
| 3 | `123` | `123` |
| 4 | `Date ()` | `Date ()` |
| 5 | `{32768,2}` | `VG.Retour Chariot` |
| 6 | `{0,4}` | `v.date Max` |
| 7 | `{0,5}` | `v. ok` |
| 8 | `'00/00/0000'DATE` | `'00/00/0000'DATE` |
| 9 | `NOT ({0,6})` | `NOT (Bouton Ok)` |
| 10 | `'TRUE'LOG` | `'TRUE'LOG` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 0 (0 W / 0 R) |
| Parametres | 3 |
| Variables locales | 8 |
| Expressions | 10 |
| Expressions 100% decodees | 9 (90%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

