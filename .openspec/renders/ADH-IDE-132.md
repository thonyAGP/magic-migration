# ADH IDE 132 - Historique session

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_132.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 132 |
| **Fichier XML** | Prg_132.xml |
| **Description** | Historique session |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 3 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_132.xml. L'ID XML (132) peut differer de la position IDE (132).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-132.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (4 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #246 | `caisse_session` | histo_sessions_caisse | R | 1x |
| #249 | `caisse_session_detail` | histo_sessions_caisse_detail | R | 1x |
| #250 | `caisse_session_devise` | histo_sessions_caisse_devise | R | 1x |
| #693 | `devisein_par` | devise_in | R | 2x |

---

## 3. PARAMETRES D'ENTREE (3)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Param societe | ALPHA | - |
| P2 | Param devise locale | ALPHA | - |
| P3 | Param masque montant | ALPHA | - |
| P4 | Fin Historique | LOGICAL | - |
| P5 | LastQuand | ALPHA | - |
| P6 | Validation comptage chrono his | NUMERIC | - |
| P7 | Validation comptage chrono date | DATE | - |
| P8 | Validation comptage chrono time | TIME | - |
| P9 | Total caisse | NUMERIC | - |

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

> Total: 136 variables mappees

---

## 5. EXPRESSIONS (45 total, 26 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,4}` | `LastQuand` |
| 1 | `150` | `150` |
| 2 | `Trim ({0,8})` | `Trim (Total caisse)` |
| 3 | `{32768,1}` | `VG.USER` |
| 4 | `Date ()` | `Date ()` |
| 5 | `'TRUE'LOG` | `'TRUE'LOG` |
| 6 | `{32768,1}` | `VG.USER` |
| 7 | `IF ({0,5}=0,MlsTrans ('Session active'),MlsTrans ('Sessio...` | `IF (Validation comptage chrono his=0,MlsTrans ('Session a...` |
| 8 | `IF ({0,7},31.5,11)` | `IF (Validation comptage chrono time,31.5,11)` |
| 9 | `IF({0,5}=0,175,174)` | `IF(Validation comptage chrono his=0,175,174)` |
| 10 | `IF({0,9},131,1)` | `IF({0,9},131,1)` |
| 11 | `'FALSE'LOG` | `'FALSE'LOG` |
| 1 | `{2,3}` | `{2,3}` |
| 2 | `'TRUE'LOG` | `'TRUE'LOG` |
| 3 | `'FALSE'LOG` | `'FALSE'LOG` |
| 4 | `{32768,1}` | `VG.USER` |
| 5 | `{1,2}` | `{1,2}` |
| 6 | `GetParam ('CODELANGUE')` | `GetParam ('CODELANGUE')` |
| 7 | `'S'` | `'S'` |
| 8 | `'Q'` | `'Q'` |
| 9 | `{0,4}` | `LastQuand` |
| 10 | `{0,5}` | `Validation comptage chrono his` |
| 11 | `'I'` | `'I'` |
| 12 | `'F'` | `'F'` |
| 13 | `{0,9}` | `{0,9}` |
| 14 | `{0,10}` | `{0,10}` |
| 15 | `{0,11}` | `{0,11}` |
| 16 | `{0,12}` | `{0,12}` |
| 17 | `{0,13}` | `{0,13}` |
| 18 | `{0,15}` | `{0,15}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 4 (0 W / 4 R) |
| Parametres | 3 |
| Variables locales | 9 |
| Expressions | 45 |
| Expressions 100% decodees | 26 (58%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

