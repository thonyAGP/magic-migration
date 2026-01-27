# ADH IDE 105 - Maj des lignes saisies V3

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_105.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 105 |
| **Fichier XML** | Prg_105.xml |
| **Description** | Maj des lignes saisies V3 |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 8 |
| **Module** | ADH |
| **Dossier IDE** | Factures V3 |

> **Note**: Ce programme est Prg_105.xml. L'ID XML (105) peut differer de la position IDE (105).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-105.yaml`
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
| #40 | `cafil018_dat` | comptable________cte | **W** | 1x |
| #263 | `caisse_vente` | vente | **W** | 1x |
| #866 | `maj_appli_tpe` | maj_appli_tpe | **W** | 1x |
| #870 | `rayons_boutique` | Rayons_Boutique | **W** | 1x |

---

## 3. PARAMETRES D'ENTREE (8)

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

> Total: 142 variables mappees

---

## 5. EXPRESSIONS (23 total, 10 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,31}=0 AND NOT {0,8}` | `{0,31}=0 AND NOT V retour Compta` |
| 2 | `{0,42}=0 AND NOT {0,8}` | `{0,42}=0 AND NOT V retour Compta` |
| 3 | `{0,4}` | `P.i.NomFacPDF` |
| 4 | `Date()` | `Date()` |
| 5 | `Time()` | `Time()` |
| 6 | `{0,5}` | `P.i.SelectionManulle` |
| 7 | `{0,1}` | `P.i.Compte` |
| 8 | `{0,2}` | `P.i.Flague` |
| 9 | `Date()` | `Date()` |
| 10 | `{0,14}` | `{0,14}` |
| 11 | `{0,29} AND Trim({0,7})<>'D'` | `{0,29} AND Trim(P.i.Facture ECO)<>'D'` |
| 12 | `{0,36} AND Trim({0,7})<>'I'` | `{0,36} AND Trim(P.i.Facture ECO)<>'I'` |
| 13 | `{0,14}` | `{0,14}` |
| 14 | `{0,22}` | `{0,22}` |
| 15 | `{0,17} = 0 OR {0,31} = 0` | `{0,17} = 0 OR {0,31} = 0` |
| 16 | `{0,6}` | `P.i.TypeReglement` |
| 17 | `IF(Trim({0,7})='','TRUE'LOG,IF(Trim({0,7})='I',{0,29},{0,...` | `IF(Trim(P.i.Facture ECO)='','TRUE'LOG,IF(Trim(P.i.Facture...` |
| 18 | `IF(Trim({0,7})='I',{0,29},{0,36})` | `IF(Trim(P.i.Facture ECO)='I',{0,29},{0,36})` |
| 19 | `{0,12}` | `{0,12}` |
| 20 | `'FALSE'LOG` | `'FALSE'LOG` |
| 21 | `CndRange(Trim({0,7})='',{0,6})` | `CndRange(Trim(P.i.Facture ECO)='',P.i.TypeReglement)` |
| 22 | `{0,35}` | `{0,35}` |
| 23 | `{0,41}` | `{0,41}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 4 (4 W / 0 R) |
| Parametres | 8 |
| Variables locales | 12 |
| Expressions | 23 |
| Expressions 100% decodees | 10 (43%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

