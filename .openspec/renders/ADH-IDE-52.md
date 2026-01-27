# ADH IDE 52 - Creation adresse_village

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_52.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 52 |
| **Fichier XML** | Prg_52.xml |
| **Description** | Creation adresse_village |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 0 |
| **Module** | ADH |
| **Dossier IDE** | Easy Check Out |

> **Note**: Ce programme est Prg_52.xml. L'ID XML (52) peut differer de la position IDE (52).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-52.yaml`
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
| #904 | `Boo_AvailibleEmployees` | Boo_AvailibleEmployees | **W** | 2x |
| #67 | `cafil045_dat` | tables___________tab | R | 1x |
| #372 | `pv_budget_dat` | pv_budget | R | 1x |

---

## 3. PARAMETRES D'ENTREE (0)

| # | Nom | Type | Description |
|---|-----|------|-------------|

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

## 5. EXPRESSIONS (21 total, 5 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `'VSERV'` | `'VSERV'` |
| 2 | `'O'` | `'O'` |
| 3 | `Trim({0,3})` | `Trim({0,3})` |
| 4 | `''` | `''` |
| 5 | `''` | `''` |
| 6 | `Counter(0)=1 AND NOT {0,29}` | `Counter(0)=1 AND NOT {0,29}` |
| 7 | `Trim({0,3})` | `Trim({0,3})` |
| 8 | `NOT({0,31})` | `NOT({0,31})` |
| 1 | `{0,1}` | `v lien adresse village` |
| 2 | `{1,9}` | `{1,9}` |
| 3 | `{1,8}` | `{1,8}` |
| 4 | `{1,10}` | `{1,10}` |
| 5 | ` {1,11}` | ` {1,11}` |
| 6 | `{1,12}` | `{1,12}` |
| 7 | `{1,13}` | `{1,13}` |
| 8 | `{1,14}` | `{1,14}` |
| 9 | `{1,15}` | `{1,15}` |
| 10 | `{1,16}` | `{1,16}` |
| 11 | `{1,17}` | `{1,17}` |
| 12 | `{1,18}` | `{1,18}` |
| 13 | `{1,23}` | `{1,23}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 3 ( W / 2 R) |
| Parametres | 0 |
| Variables locales | 2 |
| Expressions | 21 |
| Expressions 100% decodees | 5 (24%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

