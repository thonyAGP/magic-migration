# ADH IDE 8 -      Set Village info

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_8.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 8 |
| **Fichier XML** | Prg_8.xml |
| **Description** |      Set Village info |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 0 |
| **Module** | ADH |
| **Dossier IDE** | Brazil DataCatching |

> **Note**: Ce programme est Prg_8.xml. L'ID XML (8) peut differer de la position IDE (8).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-8.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (2 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #372 | `pv_budget_dat` | pv_budget | R | 1x |
| #904 | `Boo_AvailibleEmployees` | Boo_AvailibleEmployees | R | 1x |

---

## 3. PARAMETRES D'ENTREE (0)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Buffer | ALPHA | - |
| P2 | CounterTel | NUMERIC | - |
| P3 | CounterFax | NUMERIC | - |

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

## 5. EXPRESSIONS (31 total, 6 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `SetParam ('VI_CLUB',MID ({0,31},1,128))` | `SetParam ('VI_CLUB',MID ({0,31},1,128))` |
| 2 | `SetParam ('VI_CLUB',Trim({0,20}))` | `SetParam ('VI_CLUB',Trim({0,20}))` |
| 3 | `SetParam ('VI_NAME',MID ({0,31},130,128))` | `SetParam ('VI_NAME',MID ({0,31},130,128))` |
| 4 | `SetParam ('VI_NAME',Trim({0,21}))` | `SetParam ('VI_NAME',Trim({0,21}))` |
| 5 | `SetParam ('VI_ADR1',MID ({0,31},259,128))` | `SetParam ('VI_ADR1',MID ({0,31},259,128))` |
| 6 | `SetParam ('VI_ADR1',Trim({0,22}))` | `SetParam ('VI_ADR1',Trim({0,22}))` |
| 7 | `SetParam ('VI_ADR2',MID ({0,31},388,128))` | `SetParam ('VI_ADR2',MID ({0,31},388,128))` |
| 8 | `SetParam ('VI_ADR2',Trim({0,23}))` | `SetParam ('VI_ADR2',Trim({0,23}))` |
| 9 | `SetParam ('VI_ZIPC',MID ({0,31},517,128))` | `SetParam ('VI_ZIPC',MID ({0,31},517,128))` |
| 10 | `SetParam ('VI_ZIPC',Trim({0,25}))` | `SetParam ('VI_ZIPC',Trim({0,25}))` |
| 11 | `SetParam ('VI_PHON',MID ({0,31},646,128))` | `SetParam ('VI_PHON',MID ({0,31},646,128))` |
| 12 | `SetParam ('VI_PHON','Tel  '&Trim({0,26}))` | `SetParam ('VI_PHON','Tel  '&Trim({0,26}))` |
| 13 | `SetParam ('VI_FAXN',MID ({0,31},775,128))` | `SetParam ('VI_FAXN',MID ({0,31},775,128))` |
| 14 | `SetParam ('VI_FAXN','Fax  '&Trim({0,27}))` | `SetParam ('VI_FAXN','Fax  '&Trim({0,27}))` |
| 15 | `SetParam ('VI_MAIL',MID ({0,31},904,128))` | `SetParam ('VI_MAIL',MID ({0,31},904,128))` |
| 16 | `SetParam ('VI_MAIL',Trim({0,30}))` | `SetParam ('VI_MAIL',Trim({0,30}))` |
| 17 | `SetParam ('VI_SIRE',MID ({0,31},1033,128))` | `SetParam ('VI_SIRE',MID ({0,31},1033,128))` |
| 18 | `SetParam ('VI_SIRE',Trim({0,28}))` | `SetParam ('VI_SIRE',Trim({0,28}))` |
| 19 | `SetParam ('VI_VATN',MID ({0,31},1162,128))` | `SetParam ('VI_VATN',MID ({0,31},1162,128))` |
| 20 | `SetParam ('VI_VATN',Trim({0,29}))` | `SetParam ('VI_VATN',Trim({0,29}))` |
| 21 | `NOT ({0,17})` | `NOT ({0,17})` |
| 22 | `''` | `''` |
| 1 | `Counter (0)>=10` | `Counter (0)>=10` |
| 2 | `Trim ({1,31})&Left (IF ({0,2}='','',{0,2})&VarCurr ('{1,1...` | `Trim ({1,31})&Left (IF (CounterTel='','',CounterTel)&VarC...` |
| 3 | `VarCurr ('{1,1}'VAR+Counter (0))<>''` | `VarCurr ('{1,1}'VAR+Counter (0))<>''` |
| 4 | `VarName ('{1,1}'VAR+Counter (0))='PMS Village.PHONE'` | `VarName ('{1,1}'VAR+Counter (0))='PMS Village.PHONE'` |
| 5 | `VarName ('{1,1}'VAR+Counter (0))='PMS Village.FAX'` | `VarName ('{1,1}'VAR+Counter (0))='PMS Village.FAX'` |
| 6 | `{0,1}+1` | `Buffer+1` |
| 7 | `'Tel  '` | `'Tel  '` |
| 8 | `'Fax  '` | `'Fax  '` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 2 (0 W / 2 R) |
| Parametres | 0 |
| Variables locales | 4 |
| Expressions | 31 |
| Expressions 100% decodees | 6 (19%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

