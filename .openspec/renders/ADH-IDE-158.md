# ADH IDE 158 - Menu Great Member

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_157.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 158 |
| **Fichier XML** | Prg_157.xml |
| **Description** | Menu Great Member |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 6 |
| **Module** | ADH |
| **Dossier IDE** | Identification |

> **Note**: Ce programme est Prg_157.xml. L'ID XML (157) peut differer de la position IDE (158).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-158.yaml`
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

## 3. PARAMETRES D'ENTREE (6)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P. Societe | ALPHA | - |
| P2 | P. Code GM | NUMERIC | - |
| P3 | P. Filiation | NUMERIC | - |
| P4 | P. Masque montant | ALPHA | - |
| P5 | P. devise locale | ALPHA | - |
| P6 | P. nom village | ALPHA | - |
| P7 | W0 choix action | ALPHA | - |
| P8 | v.fin | LOGICAL | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0 choix action | ALPHA | - |
| v.fin | LOGICAL | - |

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
| 1 | `Date ()` | `Date ()` |
| 2 | `{32768,2}` | `VG.Retour Chariot` |
| 3 | `''` | `''` |
| 4 | `{0,7}='1'` | `v.fin='1'` |
| 5 | `{0,8}` | `{0,8}` |
| 6 | `'TRUE'LOG` | `'TRUE'LOG` |
| 7 | `'99'` | `'99'` |
| 8 | `Left (Trim ({0,4}),Len (Trim ({0,4}))-1)` | `Left (Trim (P. devise locale),Len (Trim (P. devise locale...` |
| 9 | `{0,7}='2'` | `v.fin='2'` |
| 10 | `'A'` | `'A'` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 0 (0 W / 0 R) |
| Parametres | 6 |
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

