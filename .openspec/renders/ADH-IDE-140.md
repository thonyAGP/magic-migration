# ADH IDE 140 - Init apport article session WS

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_140.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 140 |
| **Fichier XML** | Prg_140.xml |
| **Description** | Init apport article session WS |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 0 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_140.xml. L'ID XML (140) peut differer de la position IDE (140).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-140.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (3 tables -  en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #196 | `caisse_article` | gestion_article_session | **W** | 2x |
| #77 | `cafil055_dat` | articles_________art | R | 1x |
| #197 | `caisse_artstock` | articles_en_stock | R | 1x |

---

## 3. PARAMETRES D'ENTREE (0)

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

> Total: 118 variables mappees

---

## 5. EXPRESSIONS (14 total, 9 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{32768,1}` | `VG.USER` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `'TRUE'LOG` | `'TRUE'LOG` |
| 3 | `{0,1}` | `{0,1}` |
| 4 | `{0,7}+1` | `{0,7}+1` |
| 5 | `'O'` | `'O'` |
| 6 | `'A'` | `'A'` |
| 7 | `'D'` | `'D'` |
| 8 | `'P'` | `'P'` |
| 9 | `'F'` | `'F'` |
| 10 | `'ART'` | `'ART'` |
| 11 | `{0,4}` | `{0,4}` |
| 12 | `{0,5}` | `{0,5}` |
| 13 | `{0,3}` | `{0,3}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 3 ( W / 2 R) |
| Parametres | 0 |
| Variables locales | 0 |
| Expressions | 14 |
| Expressions 100% decodees | 9 (64%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

