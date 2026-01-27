# ADH IDE 103 - Facture - Sejour archive V3

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_103.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 103 |
| **Fichier XML** | Prg_103.xml |
| **Description** | Facture - Sejour archive V3 |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 3 |
| **Module** | ADH |
| **Dossier IDE** | Factures V3 |

> **Note**: Ce programme est Prg_103.xml. L'ID XML (103) peut differer de la position IDE (103).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-103.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (7 tables - 2 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #868 | `affectation_gift_pass` | Affectation_Gift_Pass | **W** | 4x |
| #870 | `rayons_boutique` | Rayons_Boutique | **W** | 2x |
| #744 | `pv_lieux_vente` | pv_lieux_vente | R | 1x |
| #746 | `version` | projet | R | 1x |
| #755 | `cafil_address_tmp` | cafil_address_tmp | R | 2x |
| #756 | `cafil_country_iso` | Country_ISO | R | 2x |
| #871 | `activite` | Activite | R | 1x |

---

## 3. PARAMETRES D'ENTREE (3)

| # | Nom | Type | Description |
|---|-----|------|-------------|

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| V.Lien Hebergement_Pro | LOGICAL | - |

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

## 5. EXPRESSIONS (109 total, 14 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,1}` | `P.Num compte` |
| 2 | `{0,2}` | `P.Fliliation` |
| 3 | `{0,3}` | `V.Lien Hebergement_Pro` |
| 4 | `{0,7}` | `{0,7}` |
| 5 | `{0,8}` | `{0,8}` |
| 6 | `NOT({0,9})` | `NOT({0,9})` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{1,3}` | `{1,3}` |
| 4 | `{1,7}` | `{1,7}` |
| 5 | `{1,8}` | `{1,8}` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{1,3}` | `{1,3}` |
| 4 | `{0,22}` | `{0,22}` |
| 5 | `{0,19}` | `{0,19}` |
| 6 | `'COMPT'` | `'COMPT'` |
| 7 | `{0,1}` | `P.Num compte` |
| 8 | `{0,2}` | `P.Fliliation` |
| 9 | `{0,3}` | `V.Lien Hebergement_Pro` |
| 10 | `{0,4}` | `{0,4}` |
| 11 | `{0,5}` | `{0,5}` |
| 12 | `{0,8}` | `{0,8}` |
| 13 | `{0,9}` | `{0,9}` |
| 14 | `{0,10}` | `{0,10}` |
| 15 | `{0,11}` | `{0,11}` |
| 16 | `{0,12}` | `{0,12}` |
| 17 | `{0,13}` | `{0,13}` |
| 18 | `{0,14}` | `{0,14}` |
| 19 | `{0,15}` | `{0,15}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 7 (2 W / 5 R) |
| Parametres | 3 |
| Variables locales | 4 |
| Expressions | 109 |
| Expressions 100% decodees | 14 (13%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

