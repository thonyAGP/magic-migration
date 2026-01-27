# ADH IDE 185 - Chained Listing Printer Choice

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_184.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 185 |
| **Fichier XML** | Prg_184.xml |
| **Description** | Chained Listing Printer Choice |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 6 |
| **Module** | ADH |
| **Dossier IDE** | Printer Management |

> **Note**: Ce programme est Prg_184.xml. L'ID XML (184) peut differer de la position IDE (185).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-185.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (1 tables -  en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #581 | `%club_user%tempocomptageb_dat` | tempo_comptage_bateau | **W** | 2x |

---

## 3. PARAMETRES D'ENTREE (6)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P Listing Nombre | NUMERIC | - |
| P2 | P Listing 01 | NUMERIC | - |
| P3 | P Listing 02 | NUMERIC | - |
| P4 | P Listing 03 | NUMERIC | - |
| P5 | P Listing 04 | NUMERIC | - |
| P6 | P Listing 05 | NUMERIC | - |
| P7 | ListingToDo | NUMERIC | - |

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

> Total: 132 variables mappees

---

## 5. EXPRESSIONS (11 total, 8 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `Counter (0)>={0,1}` | `Counter (0)>=P Listing 01` |
| 2 | `DbDel ('{581,4}'DSOURCE,'')` | `DbDel ('{581,4}'DSOURCE,'')` |
| 3 | `VarSet ('{0,7}'VAR,VarCurr ('{0,1}'VAR+Counter (0)))` | `VarSet ('{0,7}'VAR,VarCurr ('P Listing 01'VAR+Counter (0)))` |
| 1 | `{0,1}` | `P Listing 01` |
| 2 | `GetParam ('CURRENTPRINTERNUM')` | `GetParam ('CURRENTPRINTERNUM')` |
| 3 | `GetParam ('CURRENTPRINTERNAME')` | `GetParam ('CURRENTPRINTERNAME')` |
| 4 | `GetParam ('NUMBERCOPIES')` | `GetParam ('NUMBERCOPIES')` |
| 1 | `{1,7}` | `{1,7}` |
| 2 | `SetParam ('CURRENTPRINTERNUM',{0,2})` | `SetParam ('CURRENTPRINTERNUM',P Listing 02)` |
| 3 | `SetParam ('CURRENTPRINTERNAME',{0,3})` | `SetParam ('CURRENTPRINTERNAME',P Listing 03)` |
| 4 | `SetParam ('NUMBERCOPIES',{0,4})` | `SetParam ('NUMBERCOPIES',P Listing 04)` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 1 ( W / 0 R) |
| Parametres | 6 |
| Variables locales | 7 |
| Expressions | 11 |
| Expressions 100% decodees | 8 (73%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

