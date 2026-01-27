# ADH IDE 63 - Test Easy Check-Out Online

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_63.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 63 |
| **Fichier XML** | Prg_63.xml |
| **Description** | Test Easy Check-Out Online |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 0 |
| **Module** | ADH |
| **Dossier IDE** | Easy Check Out |

> **Note**: Ce programme est Prg_63.xml. L'ID XML (63) peut differer de la position IDE (63).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-63.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (8 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 1x |
| #39 | `cafil017_dat` | depot_garantie___dga | R | 1x |
| #47 | `cafil025_dat` | compte_gm________cgm | R | 1x |
| #66 | `cafil044_dat` | imputations______imp | R | 1x |
| #69 | `cafil047_dat` | initialisation___ini | R | 1x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 1x |
| #285 | `email` | email | R | 1x |

---

## 3. PARAMETRES D'ENTREE (0)

| # | Nom | Type | Description |
|---|-----|------|-------------|

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.DateJ-2 | DATE | - |
| v.Tous les insoldés | LOGICAL | - |
| v.Réponse | NUMERIC | - |
| v.clause where | ALPHA | - |

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

> Total: 130 variables mappees

---

## 5. EXPRESSIONS (17 total, 15 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `'Lancer'` | `'Lancer'` |
| 2 | `'Quitter'` | `'Quitter'` |
| 3 | `AddDate (Date(),0,0,-1)` | `AddDate (Date(),0,0,-1)` |
| 4 | `{0,1}>AddDate (Date(),0,0,-1)` | `v.Tous les insoldés>AddDate (Date(),0,0,-1)` |
| 5 | `{0,5}=6` | `v.clause where=6` |
| 6 | `'dga_date_depot='''&DStr('27/03/2022'DATE,'YYYYMMDD')&''''` | `'dga_date_depot='''&DStr('27/03/2022'DATE,'YYYYMMDD')&''''` |
| 7 | `INIPut('EmbedFonts=N','FALSE'LOG)` | `INIPut('EmbedFonts=N','FALSE'LOG)` |
| 8 | `INIPut('CompressPDF=N','FALSE'LOG)` | `INIPut('CompressPDF=N','FALSE'LOG)` |
| 1 | `{0,1}` | `v.Tous les insoldés` |
| 2 | `{0,2}` | `b.Lancer` |
| 3 | `{0,3}` | `b.Quitter` |
| 4 | `'00/00/0000'DATE` | `'00/00/0000'DATE` |
| 5 | `Trim({0,5})&Trim({0,6})<>''` | `Trim(v.clause where)&Trim({0,6})<>''` |
| 6 | `{1,1}` | `{1,1}` |
| 7 | `{0,4}` | `v.Réponse` |
| 8 | `Date()` | `Date()` |
| 9 | `Time()` | `Time()` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 8 (0 W / 8 R) |
| Parametres | 0 |
| Variables locales | 6 |
| Expressions | 17 |
| Expressions 100% decodees | 15 (88%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

