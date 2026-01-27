# ADH IDE 22 - Calcul equivalent

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_22.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 22 |
| **Fichier XML** | Prg_22.xml |
| **Description** | Calcul equivalent |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 11 |
| **Module** | ADH |
| **Dossier IDE** | Change |

> **Note**: Ce programme est Prg_22.xml. L'ID XML (22) peut differer de la position IDE (22).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-22.yaml`
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
| #50 | `cafil028_dat` | moyens_reglement_mor | R | 1x |
| #139 | `cafil117_dat` | moyens_reglement_mor | R | 1x |

---

## 3. PARAMETRES D'ENTREE (11)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | > Societe | ALPHA | - |
| P2 | > devise locale | ALPHA | - |
| P3 | > nombre de decimal | NUMERIC | - |
| P4 | > Devise | ALPHA | - |
| P5 | < cdrt devise in | LOGICAL | - |
| P6 | > mode de paiement | ALPHA | - |
| P7 | > quantite | NUMERIC | - |
| P8 | < Equivalent | NUMERIC | - |

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

> Total: 140 variables mappees

---

## 5. EXPRESSIONS (16 total, 12 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,1}` | `> Uni/BI` |
| 2 | `{0,5}` | `< cdrt devise in` |
| 3 | `{0,7}` | `> quantite` |
| 4 | `''` | `''` |
| 5 | `{0,10}` | `> Type de devise` |
| 6 | `'O'` | `'O'` |
| 7 | `Fix ({0,8}*{0,17},11,{0,4})` | `Fix (< Equivalent*{0,17},11,> Devise)` |
| 8 | `Fix ({0,8}*{0,24},11,{0,4})` | `Fix (< Equivalent*{0,24},11,> Devise)` |
| 9 | `Fix ({0,8}/{0,24},11,{0,4})` | `Fix (< Equivalent/{0,24},11,> Devise)` |
| 10 | `'FALSE'LOG` | `'FALSE'LOG` |
| 11 | `{0,11}` | `{0,11}` |
| 12 | `{0,10}='A' AND {0,2}<>'B'` | `> Type de devise='A' AND > devise locale<>'B'` |
| 13 | `{0,10}='A' AND {0,2}='B'` | `> Type de devise='A' AND > devise locale='B'` |
| 14 | `{0,2}<>'B'` | `> devise locale<>'B'` |
| 15 | `{0,2}='B'` | `> devise locale='B'` |
| 16 | `{0,10}<>'A'` | `> Type de devise<>'A'` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 2 (0 W / 2 R) |
| Parametres | 11 |
| Variables locales | 11 |
| Expressions | 16 |
| Expressions 100% decodees | 12 (75%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

