# ADH IDE 135 - Generation tableau recap WS

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_135.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 135 |
| **Fichier XML** | Prg_135.xml |
| **Description** | Generation tableau recap WS |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 25 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_135.xml. L'ID XML (135) peut differer de la position IDE (135).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-135.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (2 tables -  en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #510 | `%club_user%_pv_disctmp_dat` | pv_discounts | **W** | 1x |
| #693 | `devisein_par` | devise_in | R | 1x |

---

## 3. PARAMETRES D'ENTREE (25)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Param date comptable | DATE | - |
| P2 | Param numero session | NUMERIC | - |
| P3 | Param type | ALPHA | - |
| P4 | Param type appro_vers_coffre | ALPHA | - |
| P5 | Param mode de paiement | ALPHA | - |
| P6 | Param avec change | ALPHA | - |
| P7 | Param code devise | ALPHA | - |
| P8 | Param quantite devise | NUMERIC | - |
| P9 | Param taux devise | NUMERIC | - |
| P10 | Param montant | NUMERIC | - |
| P11 | Param montant monnaie | NUMERIC | - |
| P12 | Param montant produits | NUMERIC | - |
| P13 | Param montant cartes | NUMERIC | - |
| P14 | Param montant chèque | NUMERIC | - |
| P15 | Param montant od | NUMERIC | - |
| P16 | Param societe | ALPHA | - |
| P17 | Param compte village | NUMERIC | - |
| P18 | Param filiation | NUMERIC | - |
| P19 | Param imputation | NUMERIC | - |
| P20 | Param sous imputation | NUMERIC | - |
| P21 | Param libelle | ALPHA | - |
| P22 | Param libelle complementaire | ALPHA | - |

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

> Total: 168 variables mappees

---

## 5. EXPRESSIONS (30 total, 27 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,27}+1` | `{0,27}+1` |
| 2 | `{32768,1}` | `VG.USER` |
| 3 | `'FRA'` | `'FRA'` |
| 4 | `'T'` | `'T'` |
| 5 | `{0,1}` | `Param numero session` |
| 6 | `{0,2}` | `Param type` |
| 7 | `{0,3}` | `Param type appro_vers_coffre` |
| 8 | `{0,59}` | `{0,59}` |
| 9 | `{0,4}` | `Param mode de paiement` |
| 10 | `{0,5}` | `Param avec change` |
| 11 | `{0,6}` | `Param code devise` |
| 12 | `{0,7}` | `Param quantite devise` |
| 13 | `{0,8}` | `Param taux devise` |
| 14 | `{0,9}` | `Param montant` |
| 15 | `{0,10}` | `Param montant monnaie` |
| 16 | `{0,11}` | `Param montant produits` |
| 17 | `{0,12}` | `Param montant cartes` |
| 18 | `{0,13}` | `Param montant chèque` |
| 19 | `{0,14}` | `Param montant od` |
| 20 | `{0,15}` | `Param societe` |
| 21 | `{0,16}` | `Param compte village` |
| 22 | `{0,17}` | `Param filiation` |
| 23 | `{0,18}` | `Param imputation` |
| 24 | `{0,19}` | `Param sous imputation` |
| 25 | `{0,20}` | `Param libelle` |
| 26 | `{0,21}` | `Param libelle complementaire` |
| 27 | `{0,22}` | `Param nom GM` |
| 28 | `{0,23}` | `Param quantite article` |
| 29 | `{0,24}` | `Param prix article` |
| 30 | `{0,25}` | `{0,25}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 2 ( W /  R) |
| Parametres | 25 |
| Variables locales | 25 |
| Expressions | 30 |
| Expressions 100% decodees | 27 (90%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

