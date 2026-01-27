# ADH IDE 86 - Bar Limit

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_86.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 86 |
| **Fichier XML** | Prg_86.xml |
| **Description** | Bar Limit |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 6 |
| **Module** | ADH |
| **Dossier IDE** | EzCard |

> **Note**: Ce programme est Prg_86.xml. L'ID XML (86) peut differer de la position IDE (86).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-86.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (3 tables - 2 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #19 | `bldetail` | bl_detail | **W** | 7x |
| #312 | `ezcard` | ez_card | **W** | 4x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |

---

## 3. PARAMETRES D'ENTREE (6)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | v.plafond actuel | NUMERIC | - |
| P2 | v.plafond reste | NUMERIC | - |
| P3 | v.choix action | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.plafond actuel | NUMERIC | - |
| v.plafond reste | NUMERIC | - |
| v.choix action | ALPHA | - |
| V.Date derniere annulation | DATE | - |
| V.Time derniere annulation | TIME | - |

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

> Total: 140 variables mappees

---

## 5. EXPRESSIONS (89 total, 39 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `''` | `''` |
| 2 | `Date ()` | `Date ()` |
| 3 | `{32768,1}` | `VG.USER` |
| 4 | `{0,1}` | `p.code-8chiffres` |
| 5 | `{0,2}` | `p.filiation` |
| 6 | `{0,3}` | `p.masque montant` |
| 7 | `40` | `40` |
| 8 | `'LISTEOPE'` | `'LISTEOPE'` |
| 9 | `{0,14}='A'` | `{0,14}='A'` |
| 10 | `{0,14}='B'` | `{0,14}='B'` |
| 11 | `{0,14}='C'` | `{0,14}='C'` |
| 1 | `Date ()` | `Date ()` |
| 2 | `Time ()` | `Time ()` |
| 3 | `{32768,1}` | `VG.USER` |
| 4 | `{2,4}` | `{2,4}` |
| 1 | `{3,1}` | `{3,1}` |
| 2 | `{3,2}` | `{3,2}` |
| 3 | `{3,3}` | `{3,3}` |
| 4 | `{3,6}` | `{3,6}` |
| 5 | `'2'` | `'2'` |
| 6 | `0` | `0` |
| 7 | `{1,1}` | `{1,1}` |
| 8 | `{1,2}` | `{1,2}` |
| 9 | `{32768,1}` | `VG.USER` |
| 10 | `0` | `0` |
| 11 | `''` | `''` |
| 1 | `{3,1}` | `{3,1}` |
| 2 | `{3,2}` | `{3,2}` |
| 3 | `{3,3}` | `{3,3}` |
| 4 | `'1'` | `'1'` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 3 (2 W /  R) |
| Parametres | 6 |
| Variables locales | 11 |
| Expressions | 89 |
| Expressions 100% decodees | 39 (44%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

