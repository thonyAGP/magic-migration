# ADH IDE 141 - Init devise session WS

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_141.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 141 |
| **Fichier XML** | Prg_141.xml |
| **Description** | Init devise session WS |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 3 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_141.xml. L'ID XML (141) peut differer de la position IDE (141).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-141.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (5 tables -  en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #232 | `caisse_devise` | gestion_devise_session | **W** | 5x |
| #50 | `cafil028_dat` | moyens_reglement_mor | R | 2x |
| #90 | `cafil068_dat` | devises__________dev | R | 2x |
| #139 | `cafil117_dat` | moyens_reglement_mor | R | 2x |
| #693 | `devisein_par` | devise_in | R | 1x |

---

## 3. PARAMETRES D'ENTREE (3)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Param societe | ALPHA | - |
| P2 | Param devise locale | ALPHA | - |
| P3 | Param UNI/BI | ALPHA | - |
| P4 | Quand | ALPHA | - |

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

> Total: 126 variables mappees

---

## 5. EXPRESSIONS (50 total, 23 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{32768,1}` | `VG.USER` |
| 1 | `'FRA'` | `'FRA'` |
| 2 | `'S'` | `'S'` |
| 3 | `InStr ('IACKDL',{0,3})<>0` | `InStr ('IACKDL',Quand)<>0` |
| 4 | `InStr ('ACKDVF',{0,3})<>0` | `InStr ('ACKDVF',Quand)<>0` |
| 5 | `InStr ('A',{0,3})<>0` | `InStr ('A',Quand)<>0` |
| 6 | `'O'` | `'O'` |
| 7 | `'F'` | `'F'` |
| 8 | `'P'` | `'P'` |
| 9 | `{1,3}='B'` | `{1,3}='B'` |
| 1 | `{2,3}<>'B'` | `{2,3}<>'B'` |
| 2 | `{2,3}='B'` | `{2,3}='B'` |
| 1 | `{3,1}` | `{3,1}` |
| 2 | `{0,2}<>{3,2} AND {0,7}='O' AND {0,5}='O'` | `Param UNI/BI<>{3,2} AND {0,7}='O' AND {0,5}='O'` |
| 3 | `{0,2}` | `Param UNI/BI` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{1,4}` | `{1,4}` |
| 4 | `{4,4}` | `{4,4}` |
| 5 | `{3,3}` | `{3,3}` |
| 1 | `{3,1}` | `{3,1}` |
| 2 | `'O'` | `'O'` |
| 3 | `0` | `0` |
| 4 | `{0,2}<>{3,2}` | `Param UNI/BI<>{3,2}` |
| 5 | `{0,2}&{0,4}` | `Param UNI/BI&{0,4}` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{1,4}` | `{1,4}` |
| 4 | `{4,4}` | `{4,4}` |
| 5 | `{3,3}` | `{3,3}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 5 ( W / 4 R) |
| Parametres | 3 |
| Variables locales | 4 |
| Expressions | 50 |
| Expressions 100% decodees | 23 (46%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

