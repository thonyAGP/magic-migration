# ADH IDE 55 - Easy Check-Out === V2.00

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_55.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 55 |
| **Fichier XML** | Prg_55.xml |
| **Description** | Easy Check-Out === V2.00 |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 0 |
| **Module** | ADH |
| **Dossier IDE** | Easy Check Out |

> **Note**: Ce programme est Prg_55.xml. L'ID XML (55) peut differer de la position IDE (55).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-55.yaml`
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

## 3. PARAMETRES D'ENTREE (0)

| # | Nom | Type | Description |
|---|-----|------|-------------|

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.Date Traitement | DATE | - |
| v.Tous les insoldés | LOGICAL | - |
| v.Réponse | NUMERIC | - |
| v.clause where | ALPHA | - |
| v.compte test | NUMERIC | - |
| v.lance raison use adh | LOGICAL | - |

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

## 5. EXPRESSIONS (14 total, 13 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `'Lancer'` | `'Lancer'` |
| 2 | `'Quitter'` | `'Quitter'` |
| 3 | `AddDate (Date(),0,0,-1)` | `AddDate (Date(),0,0,-1)` |
| 4 | `{0,1}>Date()` | `v.Tous les insoldés>Date()` |
| 5 | `{0,5}=6` | `v.clause where=6` |
| 6 | `IF({0,2},'','gmc_accept_exp_co=1')` | `IF(b.Lancer,'','gmc_accept_exp_co=1')` |
| 7 | `MlsTrans('La date de traitement ne peut pas être supérieu...` | `MlsTrans('La date de traitement ne peut pas être supérieu...` |
| 8 | `{32768,3}` | `VG.DROIT ACCES IT ?` |
| 9 | `0` | `0` |
| 10 | `NOT({32768,3})` | `NOT(VG.DROIT ACCES IT ?)` |
| 11 | `{32768,111} AND {32768,112}<>0` | `VG. Interface Galaxy Grèce AND VG.Second Safe Control 1.0...` |
| 12 | `'Easy Check Out'` | `'Easy Check Out'` |
| 13 | `{0,8}` | `{0,8}` |
| 14 | `'TRUE'LOG` | `'TRUE'LOG` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 0 (0 W / 0 R) |
| Parametres | 0 |
| Variables locales | 8 |
| Expressions | 14 |
| Expressions 100% decodees | 13 (93%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

