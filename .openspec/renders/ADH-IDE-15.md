# ADH IDE 15 - keyboard

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_15.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 15 |
| **Fichier XML** | Prg_15.xml |
| **Description** | keyboard |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 1 |
| **Module** | ADH |
| **Dossier IDE** | Brazil DataCatching |

> **Note**: Ce programme est Prg_15.xml. L'ID XML (15) peut differer de la position IDE (15).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-15.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (0 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|

---

## 3. PARAMETRES D'ENTREE (1)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | p.chain | ALPHA | - |
| P2 | v.contol name | ALPHA | - |
| P3 | v.keyboard control name prev | ALPHA | - |
| P4 | v.chaine | ALPHA | - |
| P5 | btn valid | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.contol name | ALPHA | - |
| v.keyboard control name prev | ALPHA | - |
| v.chaine | ALPHA | - |

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

## 5. EXPRESSIONS (11 total, 9 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `IF (GetParam ('LANGUAGE')='SPA',3,IF (GetParam ('LANGUAGE...` | `IF (GetParam ('LANGUAGE')='SPA',3,IF (GetParam ('LANGUAGE...` |
| 2 | `LastClicked ()` | `LastClicked ()` |
| 3 | `{0,1}` | `v.contol name` |
| 4 | `{0,4}` | `btn valid` |
| 1 | `LastClicked ()` | `LastClicked ()` |
| 2 | `Trim ({1,4})&IF ({1,3}='+SPACE',' ','')&Right (LastClicke...` | `Trim ({1,4})&IF ({1,3}='+SPACE',' ','')&Right (LastClicke...` |
| 3 | `Left (Trim ({1,4}),Len (Trim ({1,4}))-1)` | `Left (Trim ({1,4}),Len (Trim ({1,4}))-1)` |
| 4 | `''` | `''` |
| 5 | `Left (LastClicked (),1)='*'` | `Left (LastClicked (),1)='*'` |
| 6 | `LastClicked ()='+BACKSPACE'` | `LastClicked ()='+BACKSPACE'` |
| 7 | `LastClicked ()='+CLEAR'` | `LastClicked ()='+CLEAR'` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 0 (0 W / 0 R) |
| Parametres | 1 |
| Variables locales | 5 |
| Expressions | 11 |
| Expressions 100% decodees | 9 (82%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

