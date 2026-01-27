# ADH IDE 84 -     SP Caractères Interdits

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_84.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 84 |
| **Fichier XML** | Prg_84.xml |
| **Description** |     SP Caractères Interdits |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 3 |
| **Module** | ADH |
| **Dossier IDE** | EzCard |

> **Note**: Ce programme est Prg_84.xml. L'ID XML (84) peut differer de la position IDE (84).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-84.yaml`
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

## 3. PARAMETRES D'ENTREE (3)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0-Code | ALPHA | - |
| P2 | P0-Accord Suite | ALPHA | - |
| P3 | P0-N/P | ALPHA | - |
| P4 | W0-Fin de Tache | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0-Fin de Tache | ALPHA | - |

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

## 5. EXPRESSIONS (11 total, 7 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `'F'` | `'F'` |
| 2 | `{0,4}='F'` | `{0,4}='F'` |
| 1 | `'F'` | `'F'` |
| 2 | `{0,1}='F'` | `P0-Accord Suite='F'` |
| 3 | `1` | `1` |
| 4 | `'O'` | `'O'` |
| 5 | `'N'` | `'N'` |
| 6 | `{1,3}='N' AND InStr ('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghi...` | `{1,3}='N' AND InStr ('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghi...` |
| 7 | `{1,3}='P' AND InStr ('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghi...` | `{1,3}='P' AND InStr ('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghi...` |
| 8 | `{0,2}+1` | `P0-N/P+1` |
| 9 | `{0,2}>=Len ({1,1})` | `P0-N/P>=Len ({1,1})` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 0 (0 W / 0 R) |
| Parametres | 3 |
| Variables locales | 4 |
| Expressions | 11 |
| Expressions 100% decodees | 7 (64%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

