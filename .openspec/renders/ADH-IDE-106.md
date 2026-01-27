# ADH IDE 106 - Maj lignes saisies archive V3

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_106.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 106 |
| **Fichier XML** | Prg_106.xml |
| **Description** | Maj lignes saisies archive V3 |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 7 |
| **Module** | ADH |
| **Dossier IDE** | Garantie |

> **Note**: Ce programme est Prg_106.xml. L'ID XML (106) peut differer de la position IDE (106).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-106.yaml`
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

## 3. PARAMETRES D'ENTREE (7)

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

> Total: 140 variables mappees

---

## 5. EXPRESSIONS (18 total, 10 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,29}=0` | `{0,29}=0` |
| 2 | `{0,39}=0` | `{0,39}=0` |
| 3 | `{0,4}` | `P.i.NomFichPDF` |
| 4 | `Date()` | `Date()` |
| 5 | `Time()` | `Time()` |
| 6 | `{0,5}` | `P.i.SelectionManuelle` |
| 7 | `{0,1}` | `P.i.Compte` |
| 8 | `{0,2}` | `P.i.Flague` |
| 9 | `Date()` | `Date()` |
| 10 | `IF({0,3},'TRUE'LOG,'FALSE'LOG)` | `IF(P.i.No_Facture,'TRUE'LOG,'FALSE'LOG)` |
| 11 | `{0,13}` | `{0,13}` |
| 12 | `{0,27}` | `{0,27}` |
| 13 | `{0,34}` | `{0,34}` |
| 14 | `{0,13}` | `{0,13}` |
| 15 | `{0,21}` | `{0,21}` |
| 16 | `{0,16}=0 OR {0,29}=0` | `{0,16}=0 OR {0,29}=0` |
| 17 | `{0,6}` | `P.i.Date Purge` |
| 18 | `{0,7}` | `V retour Compta` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 4 (4 W / 0 R) |
| Parametres | 7 |
| Variables locales | 11 |
| Expressions | 18 |
| Expressions 100% decodees | 10 (56%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

