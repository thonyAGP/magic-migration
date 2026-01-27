# ADH IDE 153 - Calcul du stock devise

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_153.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 153 |
| **Fichier XML** | Prg_153.xml |
| **Description** | Calcul du stock devise |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 4 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_153.xml. L'ID XML (153) peut differer de la position IDE (153).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-153.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (6 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #44 | `cafil022_dat` | change___________chg | R | 1x |
| #147 | `cafil125_dat` | change_vente_____chg | R | 1x |
| #232 | `caisse_devise` | gestion_devise_session | R | 2x |
| #246 | `caisse_session` | histo_sessions_caisse | R | 1x |
| #249 | `caisse_session_detail` | histo_sessions_caisse_detail | R | 1x |
| #250 | `caisse_session_devise` | histo_sessions_caisse_devise | R | 1x |

---

## 3. PARAMETRES D'ENTREE (4)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0 societe | ALPHA | - |
| P2 | P0 code devise | ALPHA | - |
| P3 | P0 MOP | ALPHA | - |
| P4 | P0 quantite devise | NUMERIC | - |
| P5 | v user session | NUMERIC | - |
| P6 | v date debut session | DATE | - |
| P7 | v heure debut session | TIME | - |

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

## 5. EXPRESSIONS (38 total, 17 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `{0,2}` | `P0 MOP` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `{1,5}` | `{1,5}` |
| 3 | `{0,3}` | `P0 quantite devise` |
| 4 | `'L'` | `'L'` |
| 5 | `'O'` | `'O'` |
| 6 | `{1,2}` | `{1,2}` |
| 7 | `{1,3}` | `{1,3}` |
| 8 | `{0,13}` | `{0,13}` |
| 9 | `{0,6}` | `v heure debut session` |
| 10 | `{0,7}` | `{0,7}` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{1,3}` | `{1,3}` |
| 4 | `'P'` | `'P'` |
| 5 | `'A'` | `'A'` |
| 6 | `{1,4}+{0,6}` | `{1,4}+v heure debut session` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{1,3}` | `{1,3}` |
| 4 | `'P'` | `'P'` |
| 5 | `'V'` | `'V'` |
| 6 | `{1,4}-{0,6}` | `{1,4}-v heure debut session` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `0` | `0` |
| 3 | `{32768,1}` | `VG.USER` |
| 4 | `{1,2}` | `{1,2}` |
| 5 | `{1,3}` | `{1,3}` |
| 6 | `{0,3}*1000000+{0,4}>={1,6}*1000000+{1,7}` | `P0 quantite devise*1000000+v user session>={1,6}*1000000+...` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 6 (0 W / 6 R) |
| Parametres | 4 |
| Variables locales | 7 |
| Expressions | 38 |
| Expressions 100% decodees | 17 (45%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

