# ADH IDE 113 - Test Activation ECO

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_113.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 113 |
| **Fichier XML** | Prg_113.xml |
| **Description** | Test Activation ECO |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 3 |
| **Module** | ADH |
| **Dossier IDE** | Garantie |

> **Note**: Ce programme est Prg_113.xml. L'ID XML (113) peut differer de la position IDE (113).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-113.yaml`
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
| P1 | p.Compte | NUMERIC | - |
| P2 | p.Traitement | ALPHA | - |
| P3 | p.mail envoyé | LOGICAL | - |
| P4 | ftm_date_creation | ALPHA | - |

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

> Total: 126 variables mappees

---

## 5. EXPRESSIONS (4 total, 3 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `Trim({0,2})&'_'&Trim(Str({0,1},'8P0'))` | `Trim(p.mail envoyé)&'_'&Trim(Str(p.Traitement,'8P0'))` |
| 2 | `'FALSE'LOG` | `'FALSE'LOG` |
| 3 | `'TRUE'LOG` | `'TRUE'LOG` |
| 4 | `Counter(0)>0 AND Range(DVal({0,4},'YYYYMMDD'),Date()-1,Da...` | `Counter(0)>0 AND Range(DVal({0,4},'YYYYMMDD'),Date()-1,Da...` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 0 (0 W / 0 R) |
| Parametres | 3 |
| Variables locales | 4 |
| Expressions | 4 |
| Expressions 100% decodees | 3 (75%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

