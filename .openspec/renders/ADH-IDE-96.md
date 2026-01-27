# ADH IDE 96 - ExistFactureVente 2

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_96.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 96 |
| **Fichier XML** | Prg_96.xml |
| **Description** | ExistFactureVente 2 |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 4 |
| **Module** | ADH |
| **Dossier IDE** | Factures V3 |

> **Note**: Ce programme est Prg_96.xml. L'ID XML (96) peut differer de la position IDE (96).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-96.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (4 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #40 | `cafil018_dat` | comptable________cte | R | 1x |
| #263 | `caisse_vente` | vente | R | 1x |
| #746 | `version` | projet | R | 1x |
| #871 | `activite` | Activite | R | 1x |

---

## 3. PARAMETRES D'ENTREE (4)

| # | Nom | Type | Description |
|---|-----|------|-------------|

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.Result | LOGICAL | - |
| v.Vente? | LOGICAL | - |
| v.Compta? | LOGICAL | - |
| v.ArcCompta? | LOGICAL | - |
| v.ArcVente | LOGICAL | - |

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

> Total: 136 variables mappees

---

## 5. EXPRESSIONS (8 total, 7 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,1}` | `P.Compte` |
| 2 | `{0,2}` | `P.Filiation` |
| 3 | `{0,3}` | `P.Facture` |
| 4 | `{0,4}` | `v.Result` |
| 5 | `{0,5}` | `v.Vente?` |
| 6 | `'FALSE'LOG` | `'FALSE'LOG` |
| 7 | `'TRUE'LOG` | `'TRUE'LOG` |
| 8 | `({0,6} AND {0,10} > 0) OR ({0,11} AND {0,15} > 0) OR ({0,...` | `(v.Compta? AND {0,10} > 0) OR ({0,11} AND {0,15} > 0) OR ...` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 4 (0 W / 4 R) |
| Parametres | 4 |
| Variables locales | 9 |
| Expressions | 8 |
| Expressions 100% decodees | 7 (88%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

