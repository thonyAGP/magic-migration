# ADH IDE 165 -    Saisies cautions

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_164.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 165 |
| **Fichier XML** | Prg_164.xml |
| **Description** |    Saisies cautions |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 3 |
| **Module** | ADH |
| **Dossier IDE** | Menus |

> **Note**: Ce programme est Prg_164.xml. L'ID XML (164) peut differer de la position IDE (165).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-165.yaml`
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
| #423 | `req_param_dat` | req_param | **W** | 4x |
| #587 | `%club_user%tmp_anniv_dat` | tempo_anniversaires | **W** | 4x |
| #735 | `arc_pv_rentals_dat` | arc_pv_cust_rentals | R | 1x |

---

## 3. PARAMETRES D'ENTREE (3)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | > societe | ALPHA | - |
| P2 | > code GM | NUMERIC | - |
| P3 | > filiation | NUMERIC | - |
| P4 | V Validation saisie | LOGICAL | - |
| P5 | v.titre | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.titre | ALPHA | - |

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

## 5. EXPRESSIONS (34 total, 22 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,1}=''` | `> code GM=''` |
| 2 | `'C'` | `'C'` |
| 3 | `Trim ({0,5})` | `Trim ({0,5})` |
| 4 | `123` | `123` |
| 5 | `{0,4}` | `v.titre` |
| 1 | `{0,1}` | `> code GM` |
| 2 | `{0,2}` | `> filiation` |
| 3 | `{0,3}` | `V Validation saisie` |
| 4 | `'FALSE'LOG` | `'FALSE'LOG` |
| 1 | `{0,1}` | `> code GM` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{1,3}` | `{1,3}` |
| 4 | `{0,2}` | `> filiation` |
| 5 | `{0,5}` | `{0,5}` |
| 1 | `IF ({0,4},143,142)` | `IF (v.titre,143,142)` |
| 2 | `{32768,2}` | `VG.Retour Chariot` |
| 3 | `Date ()` | `Date ()` |
| 4 | `'Ok'` | `'Ok'` |
| 5 | `'Abandon'` | `'Abandon'` |
| 6 | `'FALSE'LOG` | `'FALSE'LOG` |
| 7 | `'TRUE'LOG` | `'TRUE'LOG` |
| 1 | `{0,4}='TRUE'LOG` | `v.titre='TRUE'LOG` |
| 2 | `{0,4}='FALSE'LOG` | `v.titre='FALSE'LOG` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{2,2}` | `{2,2}` |
| 3 | `{2,3}` | `{2,3}` |
| 4 | `{1,2}` | `{1,2}` |
| 5 | `{32768,2}` | `VG.Retour Chariot` |
| 6 | `Date ()` | `Date ()` |
| 7 | `Time ()` | `Time ()` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 3 (2 W /  R) |
| Parametres | 3 |
| Variables locales | 5 |
| Expressions | 34 |
| Expressions 100% decodees | 22 (65%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

