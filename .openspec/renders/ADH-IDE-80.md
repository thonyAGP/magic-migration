# ADH IDE 80 -    Card scan read

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_80.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 80 |
| **Fichier XML** | Prg_80.xml |
| **Description** |    Card scan read |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 7 |
| **Module** | ADH |
| **Dossier IDE** | EzCard |

> **Note**: Ce programme est Prg_80.xml. L'ID XML (80) peut differer de la position IDE (80).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-80.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (2 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #312 | `ezcard` | ez_card | R | 1x |

---

## 3. PARAMETRES D'ENTREE (7)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | p.code-8chiffres | NUMERIC | - |
| P2 | p.filiation | NUMERIC | - |
| P3 | p.chaine U | ALPHA | - |
| P4 | p.chaine U10 | ALPHA | - |
| P5 | p.Club Med Pass select | LOGICAL | - |
| P6 | pv.card id | ALPHA | - |
| P7 | p.status | ALPHA | - |
| P8 | r.card | LOGICAL | - |

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

## 5. EXPRESSIONS (15 total, 3 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `''` | `''` |
| 2 | `{0,8}` | `{0,8}` |
| 3 | `{0,15}` | `{0,15}` |
| 4 | `{0,16}` | `{0,16}` |
| 5 | `Left ({0,17},1)` | `Left ({0,17},1)` |
| 6 | `Right (Trim ({0,17}),Len (Trim ({0,17}))-1)` | `Right (Trim ({0,17}),Len (Trim ({0,17}))-1)` |
| 7 | `'TRUE'LOG` | `'TRUE'LOG` |
| 8 | `{0,13}` | `{0,13}` |
| 9 | `{0,10}` | `{0,10}` |
| 10 | `{0,11}` | `{0,11}` |
| 11 | `{0,12}` | `{0,12}` |
| 12 | `NOT ({0,8})` | `NOT ({0,8})` |
| 13 | `{0,8}` | `{0,8}` |
| 14 | `{0,6}` | `p.status` |
| 15 | `{0,6}>'' AND NOT ({0,8})` | `p.status>'' AND NOT ({0,8})` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 2 (0 W / 2 R) |
| Parametres | 7 |
| Variables locales | 8 |
| Expressions | 15 |
| Expressions 100% decodees | 3 (20%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

