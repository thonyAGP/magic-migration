# ADH IDE 93 - Creation Pied Facture

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_93.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 93 |
| **Fichier XML** | Prg_93.xml |
| **Description** | Creation Pied Facture |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 5 |
| **Module** | ADH |
| **Dossier IDE** | Factures |

> **Note**: Ce programme est Prg_93.xml. L'ID XML (93) peut differer de la position IDE (93).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-93.yaml`
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
| #867 | `log_maj_tpe` | log_maj_tpe | **W** | 1x |
| #866 | `maj_appli_tpe` | maj_appli_tpe | R | 1x |

---

## 3. PARAMETRES D'ENTREE (5)

| # | Nom | Type | Description |
|---|-----|------|-------------|

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

> Total: 128 variables mappees

---

## 5. EXPRESSIONS (16 total, 8 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,1}` | `p.Compte` |
| 2 | `{0,4}` | `P.Flaguee` |
| 3 | `{0,24}` | `{0,24}` |
| 4 | `999` | `999` |
| 5 | `{0,2}` | `p.Filiation` |
| 6 | `{0,3}` | `p.NumFac` |
| 7 | `0` | `0` |
| 8 | `{0,38}+{0,25}` | `{0,38}+{0,25}` |
| 9 | `{0,47}+{0,25}` | `{0,47}+{0,25}` |
| 10 | `{0,39}+Round(({0,26}/(1+{0,24}/100)*{0,24}/100),12,2)` | `{0,39}+Round(({0,26}/(1+{0,24}/100)*{0,24}/100),12,2)` |
| 11 | `{0,48}+Round(({0,26}/(1+{0,24}/100)*{0,24}/100),12,2)` | `{0,48}+Round(({0,26}/(1+{0,24}/100)*{0,24}/100),12,2)` |
| 12 | `{0,40}+{0,26}` | `{0,40}+{0,26}` |
| 13 | `{0,49}+{0,26}` | `{0,49}+{0,26}` |
| 14 | `IF({32768,77},'TRUE'LOG,{0,30}<>'R')` | `IF(VG.Interfaces OB,'TRUE'LOG,{0,30}<>'R')` |
| 15 | `CndRange({32768,53},'O')` | `CndRange(VG.Facture V3.00,'O')` |
| 16 | `IsFirstRecordCycle(0)` | `IsFirstRecordCycle(0)` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 2 ( W /  R) |
| Parametres | 5 |
| Variables locales | 5 |
| Expressions | 16 |
| Expressions 100% decodees | 8 (50%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

