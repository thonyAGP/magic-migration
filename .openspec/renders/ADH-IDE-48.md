# ADH IDE 48 - Contrôles - Integrite dates

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_48.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 48 |
| **Fichier XML** | Prg_48.xml |
| **Description** | Contrôles - Integrite dates |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 3 |
| **Module** | ADH |
| **Dossier IDE** | Divers |

> **Note**: Ce programme est Prg_48.xml. L'ID XML (48) peut differer de la position IDE (48).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-48.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (7 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #40 | `cafil018_dat` | comptable________cte | R | 1x |
| #44 | `cafil022_dat` | change___________chg | R | 1x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 1x |
| #147 | `cafil125_dat` | change_vente_____chg | R | 1x |
| #246 | `caisse_session` | histo_sessions_caisse | R | 1x |
| #263 | `caisse_vente` | vente | R | 1x |
| #728 | `arc_cctotal` | arc_cc_total | R | 1x |

---

## 3. PARAMETRES D'ENTREE (3)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P. O/T/F | ALPHA | - |
| P2 | P. Societe | ALPHA | - |
| P3 | P. Contrôle OK | LOGICAL | - |
| P4 | L Anomalie pour Fermeture | LOGICAL | - |

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

## 5. EXPRESSIONS (41 total, 19 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,2}` | `P. Contrôle OK` |
| 2 | `{32768,1}` | `VG.USER` |
| 3 | `{0,1}='O'` | `P. Societe='O'` |
| 4 | `NOT (Date ()>{0,5}+Val ({0,7},'##')) OR {32768,3}` | `NOT (Date ()>{0,5}+Val ({0,7},'##')) OR VG.DROIT ACCES IT ?` |
| 5 | `Date ()>{0,5}+Val ({0,7},'##') AND NOT({32768,3})` | `Date ()>{0,5}+Val ({0,7},'##') AND NOT(VG.DROIT ACCES IT ?)` |
| 6 | `{0,1}='T'` | `P. Societe='T'` |
| 7 | `Date ()*10^5+Time ()<{0,10}*10^5+{0,11}` | `Date ()*10^5+Time ()<{0,10}*10^5+{0,11}` |
| 8 | `NOT (Date ()*10^5+Time ()<{0,10}*10^5+{0,11})` | `NOT (Date ()*10^5+Time ()<{0,10}*10^5+{0,11})` |
| 9 | `{0,1}='F'` | `P. Societe='F'` |
| 10 | `NOT ({0,12})` | `NOT ({0,12})` |
| 11 | `{0,12}` | `{0,12}` |
| 12 | `'FALSE'LOG` | `'FALSE'LOG` |
| 13 | `'TRUE'LOG` | `'TRUE'LOG` |
| 1 | `{1,2}` | `{1,2}` |
| 2 | `{1,5}` | `{1,5}` |
| 3 | `Date ()` | `Date ()` |
| 4 | `{1,12}` | `{1,12}` |
| 5 | `'TRUE'LOG` | `'TRUE'LOG` |
| 6 | `{0,3}*10^5+{0,4}>Date ()*10^5+Time ()` | `L Anomalie pour Fermeture*10^5+{0,4}>Date ()*10^5+Time ()` |
| 7 | `{32768,1}` | `VG.USER` |
| 1 | `{1,2}` | `{1,2}` |
| 2 | `{1,5}` | `{1,5}` |
| 3 | `Date ()` | `Date ()` |
| 4 | `{1,12}` | `{1,12}` |
| 5 | `'TRUE'LOG` | `'TRUE'LOG` |
| 6 | `{0,3}*10^5+{0,4}>Date ()*10^5+Time ()` | `L Anomalie pour Fermeture*10^5+{0,4}>Date ()*10^5+Time ()` |
| 7 | `{32768,1}` | `VG.USER` |
| 1 | `{1,2}` | `{1,2}` |
| 2 | `{1,5}` | `{1,5}` |
| 3 | `Date ()` | `Date ()` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 7 (0 W / 7 R) |
| Parametres | 3 |
| Variables locales | 4 |
| Expressions | 41 |
| Expressions 100% decodees | 19 (46%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

