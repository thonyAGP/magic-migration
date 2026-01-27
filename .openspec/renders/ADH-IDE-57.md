# ADH IDE 57 - Factures_Sejour

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_57.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 57 |
| **Fichier XML** | Prg_57.xml |
| **Description** | Factures_Sejour |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 4 |
| **Module** | ADH |
| **Dossier IDE** | Easy Check Out |

> **Note**: Ce programme est Prg_57.xml. L'ID XML (57) peut differer de la position IDE (57).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-57.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (6 tables - 2 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #868 | `affectation_gift_pass` | Affectation_Gift_Pass | **W** | 4x |
| #870 | `rayons_boutique` | Rayons_Boutique | **W** | 2x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #40 | `cafil018_dat` | comptable________cte | R | 1x |
| #263 | `caisse_vente` | vente | R | 1x |
| #400 | `pv_rentals_dat` | pv_cust_rentals | R | 2x |

---

## 3. PARAMETRES D'ENTREE (4)

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

> Total: 128 variables mappees

---

## 5. EXPRESSIONS (109 total, 19 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,1}` | `P.i.Num compte` |
| 2 | `{0,2}` | `P.i.Fliliation` |
| 3 | `{0,3}` | `P.i.Facture ECO` |
| 4 | `{0,8}` | `{0,8}` |
| 5 | `{0,9}` | `{0,9}` |
| 6 | `NOT({0,10})` | `NOT({0,10})` |
| 7 | `DbDel('{870,4}'DSOURCE,'')` | `DbDel('{870,4}'DSOURCE,'')` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{1,3}` | `{1,3}` |
| 4 | `{1,8}` | `{1,8}` |
| 5 | `{1,9}` | `{1,9}` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{0,22}` | `{0,22}` |
| 4 | `IF({0,19}='R','A',{0,19})` | `IF({0,19}='R','A',{0,19})` |
| 5 | `'COMPT'` | `'COMPT'` |
| 6 | `{0,1}` | `P.i.Num compte` |
| 7 | `{0,2}` | `P.i.Fliliation` |
| 8 | `{0,3}` | `P.i.Facture ECO` |
| 9 | `{0,4}` | `V.Lien Hebergement_Pro` |
| 10 | `{0,5}` | `{0,5}` |
| 11 | `{0,8}` | `{0,8}` |
| 12 | `{0,9}` | `{0,9}` |
| 14 | `{0,11}` | `{0,11}` |
| 15 | `{0,12}` | `{0,12}` |
| 16 | `IF(Trim({0,13})='','OD',{0,13})` | `IF(Trim({0,13})='','OD',{0,13})` |
| 17 | `{0,14}` | `{0,14}` |
| 18 | `{0,15}` | `{0,15}` |
| 19 | `{0,16}` | `{0,16}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 6 (2 W / 4 R) |
| Parametres | 4 |
| Variables locales | 5 |
| Expressions | 109 |
| Expressions 100% decodees | 19 (17%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

