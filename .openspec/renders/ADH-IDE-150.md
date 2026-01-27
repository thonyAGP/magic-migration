# ADH IDE 150 - Print comptage WS

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_150.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 150 |
| **Fichier XML** | Prg_150.xml |
| **Description** | Print comptage WS |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 5 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_150.xml. L'ID XML (150) peut differer de la position IDE (150).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-150.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (4 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #69 | `cafil047_dat` | initialisation___ini | R | 1x |
| #491 | `%club_user%_caisse_solde_par_mop` | soldes_par_mop | R | 4x |
| #492 | `caisse_tabrecap` | edition_tableau_recap | R | 2x |
| #493 | `%club_user%_caisse_ticket` | edition_ticket | R | 2x |

---

## 3. PARAMETRES D'ENTREE (5)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Param societe | ALPHA | - |
| P2 | Param Devise locale | ALPHA | - |
| P3 | Param Masque | ALPHA | - |
| P4 | Param quand | ALPHA | - |
| P5 | Param chrono session | NUMERIC | - |
| P6 | W0 en-tête ? | ALPHA | - |
| P7 | W0 fin tâche | ALPHA | - |
| P8 | W0 copies | NUMERIC | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0 en-tête ? | ALPHA | - |
| W0 fin tâche | ALPHA | - |
| W0 copies | NUMERIC | - |

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

## 5. EXPRESSIONS (72 total, 60 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `35` | `35` |
| 2 | `SetCrsr (2)` | `SetCrsr (2)` |
| 3 | `SetCrsr (1)` | `SetCrsr (1)` |
| 4 | `GetParam ('CURRENTPRINTERNUM')=1` | `GetParam ('CURRENTPRINTERNUM')=1` |
| 5 | `GetParam ('CURRENTPRINTERNUM')=9` | `GetParam ('CURRENTPRINTERNUM')=9` |
| 6 | `'TRUE'LOG` | `'TRUE'LOG` |
| 1 | `Counter (0)>=GetParam ('NUMBERCOPIES')` | `Counter (0)>=GetParam ('NUMBERCOPIES')` |
| 1 | `{32768,44}` | `VG.VG_FAX_VISIBLE` |
| 2 | `Date ()` | `Date ()` |
| 3 | `IF ({2,4}='O','Ouverture de la','Fermeture de la')&' '&'S...` | `IF ({2,4}='O','Ouverture de la','Fermeture de la')&' '&'S...` |
| 4 | `{2,3}` | `{2,3}` |
| 5 | `{32768,2}` | `VG.Retour Chariot` |
| 6 | `Date ()` | `Date ()` |
| 7 | `Time ()` | `Time ()` |
| 8 | `GetParam ('VI_CLUB')` | `GetParam ('VI_CLUB')` |
| 9 | `GetParam ('VI_NAME')` | `GetParam ('VI_NAME')` |
| 10 | `GetParam ('VI_ADR1')` | `GetParam ('VI_ADR1')` |
| 11 | `GetParam ('VI_ADR2')` | `GetParam ('VI_ADR2')` |
| 12 | `GetParam ('VI_ZIPC')` | `GetParam ('VI_ZIPC')` |
| 13 | `GetParam ('VI_PHON')` | `GetParam ('VI_PHON')` |
| 14 | `GetParam ('VI_FAXN')` | `GetParam ('VI_FAXN')` |
| 15 | `GetParam ('VI_MAIL')` | `GetParam ('VI_MAIL')` |
| 16 | `GetParam ('VI_SIRE')` | `GetParam ('VI_SIRE')` |
| 17 | `GetParam ('VI_VATN')` | `GetParam ('VI_VATN')` |
| 18 | `INIGet ('[MAGIC_LOGICAL_NAMES]preview')='O'` | `INIGet ('[MAGIC_LOGICAL_NAMES]preview')='O'` |
| 19 | `GetParam ('GM_ADHN')` | `GetParam ('GM_ADHN')` |
| 20 | `GetParam ('GM_ACCN')` | `GetParam ('GM_ACCN')` |
| 21 | `0` | `0` |
| 22 | `{0,10}+{0,6}` | `{0,10}+W0 fin tâche` |
| 23 | `{0,2}<>'OD' AND {0,2}<>'DEV'` | `Param Masque<>'OD' AND Param Masque<>'DEV'` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 4 (0 W / 4 R) |
| Parametres | 5 |
| Variables locales | 8 |
| Expressions | 72 |
| Expressions 100% decodees | 60 (83%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

