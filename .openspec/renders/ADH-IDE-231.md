# ADH IDE 231 - Raisons utilisation ADH

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_286.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 231 |
| **Fichier XML** | Prg_286.xml |
| **Description** | Raisons utilisation ADH |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 0 |
| **Module** | ADH |
| **Dossier IDE** | Utilitaires |

> **Note**: Ce programme est Prg_286.xml. L'ID XML (286) peut differer de la position IDE (231).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-231.yaml`
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
| #1094 | `Table_1094` | Unknown | R | 1x |

---

## 3. PARAMETRES D'ENTREE (0)

| # | Nom | Type | Description |
|---|-----|------|-------------|

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.confirmation | NUMERIC | - |
| v.id primaire | NUMERIC | - |
| v.id secondaire | NUMERIC | - |
| v.commentaire | UNICODE | - |
| v.Existe Raison Secondaire | LOGICAL | - |
| v.Retour Raison | LOGICAL | - |

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

> Total: 130 variables mappees

---

## 5. EXPRESSIONS (14 total, 8 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,40}` | `{0,40}` |
| 3 | `{32768,11}` | `VG.CODE LANGUE USER` |
| 4 | `'ADH'` | `'ADH'` |
| 2 | `0` | `0` |
| 5 | `IF({0,44},{0,41},{0,40})` | `IF({0,44},{0,41},{0,40})` |
| 6 | `{32768,11}` | `VG.CODE LANGUE USER` |
| 7 | `Trim({0,42})='' AND {0,51} AND LastClicked ()<>'Bt.Abando...` | `Trim({0,42})='' AND {0,51} AND LastClicked ()<>'Bt.Abando...` |
| 8 | `{0,39}=6` | `{0,39}=6` |
| 9 | `'ABANDON'` | `'ABANDON'` |
| 10 | `Term()` | `Term()` |
| 15 | `{0,44} AND {0,40}<>0` | `{0,44} AND {0,40}<>0` |
| 12 | `{0,54}` | `{0,54}` |
| 13 | `Date()` | `Date()` |
| 14 | `Time()` | `Time()` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 1 (0 W /  R) |
| Parametres | 0 |
| Variables locales | 6 |
| Expressions | 14 |
| Expressions 100% decodees | 8 (57%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

