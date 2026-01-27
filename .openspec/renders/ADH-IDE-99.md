# ADH IDE 99 - Verif boutique V3

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_99.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 99 |
| **Fichier XML** | Prg_99.xml |
| **Description** | Verif boutique V3 |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 4 |
| **Module** | ADH |
| **Dossier IDE** | Factures V3 |

> **Note**: Ce programme est Prg_99.xml. L'ID XML (99) peut differer de la position IDE (99).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-99.yaml`
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
| #866 | `maj_appli_tpe` | maj_appli_tpe | R | 1x |

---

## 3. PARAMETRES D'ENTREE (4)

| # | Nom | Type | Description |
|---|-----|------|-------------|

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.Existe ligne boutique ? | LOGICAL | - |

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

## 5. EXPRESSIONS (9 total, 7 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,1}` | `P.Compte` |
| 2 | `{0,2}` | `P.Row id vente` |
| 3 | `CndRange({0,3}<>0,{0,3})` | `CndRange(P.Ligne manquante ?<>0,P.Ligne manquante ?)` |
| 4 | `'R'` | `'R'` |
| 5 | `{0,9}` | `{0,9}` |
| 6 | `1` | `1` |
| 7 | `'TRUE'LOG` | `'TRUE'LOG` |
| 8 | `NOT {0,10}` | `NOT {0,10}` |
| 9 | `'FALSE'LOG` | `'FALSE'LOG` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 1 (0 W /  R) |
| Parametres | 4 |
| Variables locales | 5 |
| Expressions | 9 |
| Expressions 100% decodees | 7 (78%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

