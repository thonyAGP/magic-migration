# ADH IDE 40 - Comptes de depôt

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_40.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 40 |
| **Fichier XML** | Prg_40.xml |
| **Description** | Comptes de depôt |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 8 |
| **Module** | ADH |
| **Dossier IDE** | Depot |

> **Note**: Ce programme est Prg_40.xml. L'ID XML (40) peut differer de la position IDE (40).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-40.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (8 tables - 6 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #41 | `cafil019_dat` | depot_objets_____doa | **W** | 5x |
| #42 | `cafil020_dat` | depot_devises____dda | **W** | 2x |
| #43 | `cafil021_dat` | solde_devises____sda | **W** | 4x |
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 2x |
| #367 | `pmsprintparamdefault` | pms_print_param_default | **W** | 1x |
| #456 | `taistart` | tai_demarrage | **W** | 3x |
| #50 | `cafil028_dat` | moyens_reglement_mor | R | 1x |
| #67 | `cafil045_dat` | tables___________tab | R | 1x |

---

## 3. PARAMETRES D'ENTREE (8)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | > societe | ALPHA | - |
| P2 | > code adherent | NUMERIC | - |
| P3 | > filiation | NUMERIC | - |
| P4 | > devise locale | ALPHA | - |
| P5 | > nb decimale | NUMERIC | - |
| P6 | > masque montant | ALPHA | - |
| P7 | > nom village | ALPHA | - |
| P8 | > change uni/bi ? | ALPHA | - |
| P9 | W0 reseau | ALPHA | - |
| P10 | W0 fin de tache | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0 reseau | ALPHA | - |
| W0 fin de tache | ALPHA | - |

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

> Total: 138 variables mappees

---

## 5. EXPRESSIONS (237 total, 136 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,9}<>'R'` | `W0 fin de tache<>'R'` |
| 2 | `'F'` | `'F'` |
| 3 | `{0,10}='F'` | `{0,10}='F'` |
| 4 | `'C'` | `'C'` |
| 5 | `{0,1}=''` | `> code adherent=''` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{0,3}` | `> devise locale` |
| 4 | `{1,9}='R'` | `{1,9}='R'` |
| 5 | `{1,9}<>'R'` | `{1,9}<>'R'` |
| 6 | `'R'` | `'R'` |
| 1 | `Trim ({0,18})` | `Trim ({0,18})` |
| 2 | `10` | `10` |
| 3 | `'&Quitter'` | `'&Quitter'` |
| 4 | `'I'` | `'I'` |
| 5 | `{0,1}='S'` | `> code adherent='S'` |
| 6 | `InStr ('SO',{0,1})>0` | `InStr ('SO',> code adherent)>0` |
| 7 | `InStr ('SD',{0,1})>0` | `InStr ('SD',> code adherent)>0` |
| 8 | `{0,1}='D' AND {0,7}='O'` | `> code adherent='D' AND > change uni/bi ?='O'` |
| 9 | `{0,1}='O' AND {0,7}='O'` | `> code adherent='O' AND > change uni/bi ?='O'` |
| 10 | `{0,3}='OD'` | `> devise locale='OD'` |
| 11 | `{0,3}='DD' OR {0,3}='DP'` | `> devise locale='DD' OR > devise locale='DP'` |
| 12 | `Left ({0,3},1)='D'` | `Left (> devise locale,1)='D'` |
| 13 | `{0,3}='DD' OR {0,3}='DP'` | `> devise locale='DD' OR > devise locale='DP'` |
| 14 | `{0,3}='DT'` | `> devise locale='DT'` |
| 15 | `InStr ('AI',{0,2})>0` | `InStr ('AI',> filiation)>0` |
| 16 | `{0,2}=''` | `> filiation=''` |
| 17 | `Date ()` | `Date ()` |
| 18 | `Time ()` | `Time ()` |
| 19 | `{32768,1}` | `VG.USER` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 8 (6 W / 2 R) |
| Parametres | 8 |
| Variables locales | 10 |
| Expressions | 237 |
| Expressions 100% decodees | 136 (57%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

