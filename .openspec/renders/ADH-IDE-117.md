# ADH IDE 117 - Historique session

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_117.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 117 |
| **Fichier XML** | Prg_117.xml |
| **Description** | Historique session |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 4 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_117.xml. L'ID XML (117) peut differer de la position IDE (117).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-117.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (3 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #246 | `caisse_session` | histo_sessions_caisse | R | 1x |
| #249 | `caisse_session_detail` | histo_sessions_caisse_detail | R | 1x |
| #693 | `devisein_par` | devise_in | R | 1x |

---

## 3. PARAMETRES D'ENTREE (4)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Param societe | ALPHA | - |
| P2 | Param devise locale | ALPHA | - |
| P3 | Param masque montant | ALPHA | - |
| P4 | Param user | ALPHA | - |
| P5 | Fin Historique | LOGICAL | - |
| P6 | LastQuand | ALPHA | - |
| P7 | Validation comptage chrono his | NUMERIC | - |
| P8 | Validation comptage chrono date | DATE | - |
| P9 | Validation comptage chrono time | TIME | - |
| P10 | Total caisse | NUMERIC | - |

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

> Total: 138 variables mappees

---

## 5. EXPRESSIONS (38 total, 24 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,5}` | `LastQuand` |
| 1 | `162` | `162` |
| 2 | `Trim ({0,9})` | `Trim (Total caisse)` |
| 3 | `{32768,1}` | `VG.USER` |
| 4 | `Date ()` | `Date ()` |
| 5 | `'TRUE'LOG` | `'TRUE'LOG` |
| 6 | `'FALSE'LOG` | `'FALSE'LOG` |
| 7 | `{1,4}` | `{1,4}` |
| 8 | `IF ({0,6}=0,MlsTrans ('Session active'),MlsTrans ('Sessio...` | `IF (Validation comptage chrono his=0,MlsTrans ('Session a...` |
| 9 | `IF ({0,1},131,1)` | `IF (Param devise locale,131,1)` |
| 10 | `IF({0,6}=0,175,174)` | `IF(Validation comptage chrono his=0,175,174)` |
| 11 | `IF ({0,8},31.5,11)` | `IF (Validation comptage chrono time,31.5,11)` |
| 1 | `'TRUE'LOG` | `'TRUE'LOG` |
| 1 | `{2,3}` | `{2,3}` |
| 2 | `'TRUE'LOG` | `'TRUE'LOG` |
| 3 | `'FALSE'LOG` | `'FALSE'LOG` |
| 4 | `{32768,1}` | `VG.USER` |
| 5 | `{2,4}` | `{2,4}` |
| 6 | `{1,3}` | `{1,3}` |
| 7 | `GetParam ('CODELANGUE')` | `GetParam ('CODELANGUE')` |
| 8 | `'S'` | `'S'` |
| 9 | `'Q'` | `'Q'` |
| 10 | `{0,5}` | `LastQuand` |
| 11 | `{0,6}` | `Validation comptage chrono his` |
| 12 | `IF ({0,1},131,1)` | `IF (Param devise locale,131,1)` |
| 13 | `IF ({0,1},IF ({1,6}=0,175,174),110)` | `IF (Param devise locale,IF ({1,6}=0,175,174),110)` |
| 14 | `IF({1,6}=0,175,174)` | `IF({1,6}=0,175,174)` |
| 15 | `'I'` | `'I'` |
| 16 | `'F'` | `'F'` |
| 17 | `{0,1}` | `Param devise locale` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 3 (0 W / 3 R) |
| Parametres | 4 |
| Variables locales | 10 |
| Expressions | 38 |
| Expressions 100% decodees | 24 (63%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

