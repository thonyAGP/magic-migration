# ADH IDE 18 - Print extrait compte

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_18.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 18 |
| **Fichier XML** | Prg_18.xml |
| **Description** | Print extrait compte |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 7 |
| **Module** | ADH |
| **Dossier IDE** | Brazil DataCatching |

> **Note**: Ce programme est Prg_18.xml. L'ID XML (18) peut differer de la position IDE (18).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-18.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (3 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 4x |
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 3x |
| #40 | `cafil018_dat` | comptable________cte | R | 3x |

---

## 3. PARAMETRES D'ENTREE (7)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0 société | ALPHA | - |
| P2 | P0 n° compte | NUMERIC | - |
| P3 | P0 filiation | NUMERIC | - |
| P4 | P0 masque montant | ALPHA | - |
| P5 | P0 nom village | ALPHA | - |
| P6 | P0 fictif | LOGICAL | - |
| P7 | P0 date comptable | DATE | - |
| P8 | W0 imprimante | NUMERIC | - |
| P9 | W0 titre | ALPHA | - |
| P10 | W0 nom adhérent | ALPHA | - |
| P11 | W0 prénom adhérent | ALPHA | - |
| P12 | W0 n° adhérent | NUMERIC | - |
| P13 | W0 lettre contrôle | ALPHA | - |
| P14 | W0 filiation | NUMERIC | - |
| P15 | W0 masque extrait | ALPHA | - |
| P16 | W0 langue parlée | ALPHA | - |
| P17 | W0 devise locale | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0 imprimante | NUMERIC | - |
| W0 titre | ALPHA | - |
| W0 nom adhérent | ALPHA | - |
| W0 prénom adhérent | ALPHA | - |
| W0 n° adhérent | NUMERIC | - |
| W0 lettre contrôle | ALPHA | - |
| W0 filiation | NUMERIC | - |
| W0 masque extrait | ALPHA | - |
| W0 langue parlée | ALPHA | - |
| W0 devise locale | ALPHA | - |

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

> Total: 152 variables mappees

---

## 5. EXPRESSIONS (97 total, 85 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `SetCrsr (1)` | `SetCrsr (1)` |
| 2 | `SetCrsr (2)` | `SetCrsr (2)` |
| 3 | `Left ({0,4},Len (RTrim ({0,4}))-1)` | `Left (P0 nom village,Len (RTrim (P0 nom village))-1)` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{1,3}` | `{1,3}` |
| 4 | `{0,7}` | `W0 imprimante` |
| 5 | `{0,8}` | `W0 titre` |
| 6 | `IF ({0,9}='H','Mr',IF ({0,9}='F','Me',''))` | `IF (W0 nom adhérent='H','Mr',IF (W0 nom adhérent='F','Me'...` |
| 7 | `{0,4}` | `P0 nom village` |
| 8 | `{0,5}` | `P0 fictif` |
| 9 | `{0,6}` | `P0 date comptable` |
| 10 | `{0,10}` | `W0 prénom adhérent` |
| 1 | `GetParam ('LANGUAGE')='ENG'` | `GetParam ('LANGUAGE')='ENG'` |
| 2 | `GetParam ('LANGUAGE')='FRE'` | `GetParam ('LANGUAGE')='FRE'` |
| 3 | `GetParam ('LANGUAGE')='SPA'` | `GetParam ('LANGUAGE')='SPA'` |
| 1 | `{32768,44}` | `VG.VG_FAX_VISIBLE` |
| 2 | `SetCrsr (1)` | `SetCrsr (1)` |
| 3 | `SetCrsr (2)` | `SetCrsr (2)` |
| 4 | `{2,1}` | `{2,1}` |
| 5 | `{2,2}` | `{2,2}` |
| 6 | `{0,10}+{0,20}` | `W0 prénom adhérent+{0,20}` |
| 7 | `{0,12}` | `W0 lettre contrôle` |
| 8 | `{0,14}` | `W0 masque extrait` |
| 9 | `IF ({0,10}>0,MlsTrans ('Credit. Please contact reception'...` | `IF (W0 prénom adhérent>0,MlsTrans ('Credit. Please contac...` |
| 10 | `Date ()` | `Date ()` |
| 11 | `Time ()` | `Time ()` |
| 12 | `INIGet ('[MAGIC_LOGICAL_NAMES]preview')='O'` | `INIGet ('[MAGIC_LOGICAL_NAMES]preview')='O'` |
| 13 | `GetParam ('VI_CLUB')` | `GetParam ('VI_CLUB')` |
| 14 | `GetParam ('VI_NAME')` | `GetParam ('VI_NAME')` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 3 (0 W / 3 R) |
| Parametres | 7 |
| Variables locales | 17 |
| Expressions | 97 |
| Expressions 100% decodees | 85 (88%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

