# ADH IDE 17 - Print C/O confirmation

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_17.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 17 |
| **Fichier XML** | Prg_17.xml |
| **Description** | Print C/O confirmation |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 7 |
| **Module** | ADH |
| **Dossier IDE** | Brazil DataCatching |

> **Note**: Ce programme est Prg_17.xml. L'ID XML (17) peut differer de la position IDE (17).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-17.yaml`
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

## 5. EXPRESSIONS (93 total, 84 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `SetCrsr (1)` | `SetCrsr (1)` |
| 2 | `SetCrsr (2)` | `SetCrsr (2)` |
| 3 | `Left ({0,4},Len (RTrim ({0,4}))-1)` | `Left (P0 nom village,Len (RTrim (P0 nom village))-1)` |
| 1 | `{0,8}` | `W0 titre` |
| 2 | `{0,9}` | `W0 nom adhérent` |
| 3 | `IF ({0,10}='H','Mr',IF ({0,10}='F','Me',''))` | `IF (W0 prénom adhérent='H','Mr',IF (W0 prénom adhérent='F...` |
| 4 | `{0,5}` | `P0 fictif` |
| 5 | `{0,6}` | `P0 date comptable` |
| 6 | `{0,7}` | `W0 imprimante` |
| 7 | `'F'` | `'F'` |
| 8 | `{0,1}='F'` | `P0 n° compte='F'` |
| 9 | `{0,11}` | `W0 n° adhérent` |
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
| 9 | `Date ()` | `Date ()` |
| 10 | `Time ()` | `Time ()` |
| 11 | `INIGet ('[MAGIC_LOGICAL_NAMES]preview')='O'` | `INIGet ('[MAGIC_LOGICAL_NAMES]preview')='O'` |
| 12 | `GetParam ('VI_CLUB')` | `GetParam ('VI_CLUB')` |
| 13 | `GetParam ('VI_NAME')` | `GetParam ('VI_NAME')` |
| 14 | `GetParam ('VI_ADR1')` | `GetParam ('VI_ADR1')` |
| 15 | `GetParam ('VI_ADR2')` | `GetParam ('VI_ADR2')` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 3 (0 W / 3 R) |
| Parametres | 7 |
| Variables locales | 17 |
| Expressions | 93 |
| Expressions 100% decodees | 84 (90%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

