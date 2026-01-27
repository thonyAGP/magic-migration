# ADH IDE 146 - Devises tableau recap WS

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_146.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 146 |
| **Fichier XML** | Prg_146.xml |
| **Description** | Devises tableau recap WS |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 1 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_146.xml. L'ID XML (146) peut differer de la position IDE (146).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-146.yaml`
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
| #513 | `%club_user%_pv_filiations` | pv_invoiceprintfiliationtmp | **W** | 2x |
| #232 | `caisse_devise` | gestion_devise_session | R | 1x |
| #250 | `caisse_session_devise` | histo_sessions_caisse_devise | R | 1x |

---

## 3. PARAMETRES D'ENTREE (1)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Param N° session | NUMERIC | - |

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

> Total: 120 variables mappees

---

## 5. EXPRESSIONS (25 total, 13 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `DbDel ('{513,4}'DSOURCE,'')` | `DbDel ('{513,4}'DSOURCE,'')` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `'F'` | `'F'` |
| 3 | `InStr ('LK',{0,5})<>0` | `InStr ('LK',{0,5})<>0` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `'T'` | `'T'` |
| 3 | `{1,5}` | `{1,5}` |
| 4 | `{1,2}` | `{1,2}` |
| 5 | `{1,3}` | `{1,3}` |
| 6 | `{1,6}` | `{1,6}` |
| 7 | `1` | `1` |
| 8 | `3` | `3` |
| 9 | `{0,3}='L'` | `{0,3}='L'` |
| 10 | `{0,3}='K'` | `{0,3}='K'` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `{1,1}` | `{1,1}` |
| 3 | `'V'` | `'V'` |
| 4 | `'P'` | `'P'` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `'T'` | `'T'` |
| 3 | `'V'` | `'V'` |
| 4 | `{1,6}` | `{1,6}` |
| 5 | `{1,7}` | `{1,7}` |
| 6 | `{0,6}+{1,8}` | `{0,6}+{1,8}` |
| 7 | `2` | `2` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 3 ( W / 2 R) |
| Parametres | 1 |
| Variables locales | 1 |
| Expressions | 25 |
| Expressions 100% decodees | 13 (52%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

