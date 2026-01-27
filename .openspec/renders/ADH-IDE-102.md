# ADH IDE 102 - Maj lignes saisies archive V3

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_102.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 102 |
| **Fichier XML** | Prg_102.xml |
| **Description** | Maj lignes saisies archive V3 |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 5 |
| **Module** | ADH |
| **Dossier IDE** | Factures V3 |

> **Note**: Ce programme est Prg_102.xml. L'ID XML (102) peut differer de la position IDE (102).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-102.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (4 tables - 4 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #746 | `version` | projet | **W** | 1x |
| #866 | `maj_appli_tpe` | maj_appli_tpe | **W** | 1x |
| #870 | `rayons_boutique` | Rayons_Boutique | **W** | 1x |
| #871 | `activite` | Activite | **W** | 1x |

---

## 3. PARAMETRES D'ENTREE (5)

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

> Total: 136 variables mappees

---

## 5. EXPRESSIONS (14 total, 7 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,25}=0` | `{0,25}=0` |
| 2 | `{0,34}=0` | `{0,34}=0` |
| 3 | `{0,4}` | `p.NomFichPDF` |
| 4 | `Date()` | `Date()` |
| 5 | `{0,5}` | `V retour Compta` |
| 6 | `{0,1}` | `p.Compte` |
| 7 | `{0,2}` | `P.Flague` |
| 8 | `Date()` | `Date()` |
| 9 | `IF({0,3},'TRUE'LOG,'FALSE'LOG)` | `IF(p.No_Facture,'TRUE'LOG,'FALSE'LOG)` |
| 10 | `{0,11}` | `{0,11}` |
| 11 | `{0,23}` | `{0,23}` |
| 12 | `{0,29}` | `{0,29}` |
| 13 | `{0,11}` | `{0,11}` |
| 14 | `{0,19}` | `{0,19}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 4 (4 W / 0 R) |
| Parametres | 5 |
| Variables locales | 9 |
| Expressions | 14 |
| Expressions 100% decodees | 7 (50%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

