# ADH IDE 30 - Read histo Fus_Sep_Det

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_30.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 30 |
| **Fichier XML** | Prg_30.xml |
| **Description** | Read histo Fus_Sep_Det |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 8 |
| **Module** | ADH |
| **Dossier IDE** | Changement Compte |

> **Note**: Ce programme est Prg_30.xml. L'ID XML (30) peut differer de la position IDE (30).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-30.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (5 tables - 2 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 2x |
| #343 | `histo_fus_sep_saisie` | histo_fusionseparation_saisie | **W** | 2x |
| #23 | `cafil001_dat` | reseau_cloture___rec | R | 4x |
| #340 | `histo_fus_sep` | histo_fusionseparation | R | 1x |
| #341 | `histo_fus_sep_detail` | histo_fusionseparation_detail | R | 1x |

---

## 3. PARAMETRES D'ENTREE (8)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | i type F/E | ALPHA | - |
| P2 | i societe | ALPHA | - |
| P3 | i chrono reprise | NUMERIC | - |
| P4 | i position reprise | ALPHA | - |
| P5 | i taskNumber | NUMERIC | - |
| P6 | i compte reference | NUMERIC | - |
| P7 | o toDo | LOGICAL | - |
| P8 | o etat reseau | ALPHA | - |
| P9 | exist | LOGICAL | - |

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

## 5. EXPRESSIONS (52 total, 36 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `'TRUE'LOG` | `'TRUE'LOG` |
| 2 | `{0,3}` | `i position reprise` |
| 3 | `{0,4}` | `i taskNumber` |
| 4 | `{0,5}` | `i compte reference` |
| 5 | `'FALSE'LOG` | `'FALSE'LOG` |
| 6 | `{0,9}` | `{0,9}` |
| 7 | `{0,7}` | `o etat reseau` |
| 8 | `{0,4}='1F' AND {0,5}=10` | `i taskNumber='1F' AND i compte reference=10` |
| 9 | `{0,4}='1F' AND {0,5}=20` | `i taskNumber='1F' AND i compte reference=20` |
| 10 | `{0,4}='1F' AND {0,5}=30` | `i taskNumber='1F' AND i compte reference=30` |
| 11 | `{0,4}='3E' AND {0,5}=50` | `i taskNumber='3E' AND i compte reference=50` |
| 12 | `{0,4}='3E' AND {0,5}=60` | `i taskNumber='3E' AND i compte reference=60` |
| 13 | `NOT {32768,78}` | `NOT VG.Hostname au lieu de Term` |
| 14 | `{32768,78}` | `VG.Hostname au lieu de Term` |
| 1 | `{1,2}` | `{1,2}` |
| 2 | `{32768,79}` | `VG.Numéro pseudo terminal` |
| 3 | `'T'` | `'T'` |
| 4 | `'FALSE'LOG` | `'FALSE'LOG` |
| 5 | `{0,1}` | `i societe` |
| 1 | `{1,2}` | `{1,2}` |
| 2 | `0` | `0` |
| 3 | `'T'` | `'T'` |
| 4 | `'FALSE'LOG` | `'FALSE'LOG` |
| 5 | `{0,1}` | `i societe` |
| 6 | `GetHostName()` | `GetHostName()` |
| 1 | `{2,2}` | `{2,2}` |
| 2 | `{2,6}` | `{2,6}` |
| 3 | `{0,4}` | `i taskNumber` |
| 4 | `''` | `''` |
| 1 | `{1,1}='F'` | `{1,1}='F'` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 5 (2 W / 3 R) |
| Parametres | 8 |
| Variables locales | 9 |
| Expressions | 52 |
| Expressions 100% decodees | 36 (69%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

