# ADH IDE 39 - Print extrait ObjDevSce

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_39.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 39 |
| **Fichier XML** | Prg_39.xml |
| **Description** | Print extrait ObjDevSce |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 5 |
| **Module** | ADH |
| **Dossier IDE** | Depot |

> **Note**: Ce programme est Prg_39.xml. L'ID XML (39) peut differer de la position IDE (39).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-39.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (7 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 1x |
| #34 | `cafil012_dat` | hebergement______heb | R | 1x |
| #41 | `cafil019_dat` | depot_objets_____doa | R | 8x |
| #42 | `cafil020_dat` | depot_devises____dda | R | 8x |
| #43 | `cafil021_dat` | solde_devises____sda | R | 7x |
| #456 | `taistart` | tai_demarrage | R | 8x |

---

## 3. PARAMETRES D'ENTREE (5)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0 societe | ALPHA | - |
| P2 | P0 code adherent | NUMERIC | - |
| P3 | P0 filiation | NUMERIC | - |
| P4 | P0 nom village | ALPHA | - |
| P5 | PO Retour devise | NUMERIC | - |
| P6 | W0 fin tâche | ALPHA | - |
| P7 | W0 existe objet | LOGICAL | - |
| P8 | W0 existe devise | LOGICAL | - |
| P9 | W0 existe scelle | LOGICAL | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0 fin tâche | ALPHA | - |
| W0 existe objet | LOGICAL | - |
| W0 existe devise | LOGICAL | - |
| W0 existe scelle | LOGICAL | - |
| W0 Nom | ALPHA | - |
| W0 Prénom | ALPHA | - |
| W0 Titre | ALPHA | - |
| W0 Num Adherent | NUMERIC | - |
| W0 Lettre Controle | ALPHA | - |
| W0 Filiation Club | NUMERIC | - |
| W0 Langue Parlée | ALPHA | - |
| W0 Chambre | ALPHA | - |

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

## 5. EXPRESSIONS (371 total, 264 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `SetCrsr (2)` | `SetCrsr (2)` |
| 2 | `SetCrsr (1)` | `SetCrsr (1)` |
| 3 | `GetParam ('CURRENTPRINTERNUM')=1` | `GetParam ('CURRENTPRINTERNUM')=1` |
| 4 | `GetParam ('CURRENTPRINTERNUM')=4` | `GetParam ('CURRENTPRINTERNUM')=4` |
| 5 | `GetParam ('CURRENTPRINTERNUM')=5` | `GetParam ('CURRENTPRINTERNUM')=5` |
| 6 | `GetParam ('CURRENTPRINTERNUM')=8` | `GetParam ('CURRENTPRINTERNUM')=8` |
| 7 | `GetParam ('CURRENTPRINTERNUM')=9` | `GetParam ('CURRENTPRINTERNUM')=9` |
| 8 | `'TRUE'LOG` | `'TRUE'LOG` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{1,3}` | `{1,3}` |
| 4 | `Date ()` | `Date ()` |
| 5 | `'H'` | `'H'` |
| 6 | `ASCIIChr (33)` | `ASCIIChr (33)` |
| 7 | `{0,8}` | `W0 existe scelle` |
| 8 | `{0,16}` | `W0 Chambre` |
| 9 | `IF ({0,10}='H','Mr',IF ({0,10}='F','Me',''))` | `IF (W0 Prénom='H','Mr',IF (W0 Prénom='F','Me',''))` |
| 10 | `{0,5}` | `W0 fin tâche` |
| 11 | `{0,6}` | `W0 existe objet` |
| 12 | `{0,7}` | `W0 existe devise` |
| 13 | `{0,11}` | `W0 Titre` |
| 14 | `{0,22}` | `{0,22}` |
| 1 | `Counter (0)>=GetParam ('NUMBERCOPIES')` | `Counter (0)>=GetParam ('NUMBERCOPIES')` |
| 2 | `SetParam ('CURRENTPAGENUMBER',0)` | `SetParam ('CURRENTPAGENUMBER',0)` |
| 1 | `{32768,44}` | `VG.VG_FAX_VISIBLE` |
| 2 | `Date ()` | `Date ()` |
| 3 | `Time ()` | `Time ()` |
| 4 | `GetParam ('VI_CLUB')` | `GetParam ('VI_CLUB')` |
| 5 | `GetParam ('VI_NAME')` | `GetParam ('VI_NAME')` |
| 6 | `GetParam ('VI_ADR1')` | `GetParam ('VI_ADR1')` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 7 (0 W / 7 R) |
| Parametres | 5 |
| Variables locales | 17 |
| Expressions | 371 |
| Expressions 100% decodees | 264 (71%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

