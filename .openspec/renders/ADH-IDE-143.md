# ADH IDE 143 - Devises calcul ecart WS

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_143.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 143 |
| **Fichier XML** | Prg_143.xml |
| **Description** | Devises calcul ecart WS |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 5 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_143.xml. L'ID XML (143) peut differer de la position IDE (143).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-143.yaml`
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
| #50 | `cafil028_dat` | moyens_reglement_mor | R | 1x |
| #139 | `cafil117_dat` | moyens_reglement_mor | R | 1x |
| #232 | `caisse_devise` | gestion_devise_session | R | 2x |

---

## 3. PARAMETRES D'ENTREE (5)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Param societe | ALPHA | - |
| P2 | Param devise locale | ALPHA | - |
| P3 | Param quand | ALPHA | - |
| P4 | Param difference | LOGICAL | - |
| P5 | Param UNI/BI | ALPHA | - |

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

> Total: 128 variables mappees

---

## 5. EXPRESSIONS (27 total, 16 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,5}<>'B'` | `{0,5}<>'B'` |
| 2 | `{0,5}='B'` | `{0,5}='B'` |
| 1 | `{0,1}` | `Param devise locale` |
| 2 | `{32768,1}` | `VG.USER` |
| 3 | `{0,6}` | `{0,6}` |
| 4 | `{0,8}` | `{0,8}` |
| 5 | `{0,3}` | `Param difference` |
| 6 | `'C'` | `'C'` |
| 7 | `'K'` | `'K'` |
| 8 | `'TRUE'LOG` | `'TRUE'LOG` |
| 9 | `{0,14}<>{0,20}` | `{0,14}<>{0,20}` |
| 10 | `{0,6}<>{0,2}` | `{0,6}<>Param quand` |
| 11 | `'FALSE'LOG` | `'FALSE'LOG` |
| 1 | `{0,1}` | `Param devise locale` |
| 2 | `'O'` | `'O'` |
| 3 | `0` | `0` |
| 4 | `{32768,1}` | `VG.USER` |
| 5 | `{0,6}` | `{0,6}` |
| 6 | `{0,8}` | `{0,8}` |
| 7 | `{0,3}` | `Param difference` |
| 8 | `'C'` | `'C'` |
| 9 | `'K'` | `'K'` |
| 10 | `'TRUE'LOG` | `'TRUE'LOG` |
| 11 | `{0,16}<>{0,22}` | `{0,16}<>{0,22}` |
| 12 | `{0,6}<>{0,2}` | `{0,6}<>Param quand` |
| 13 | `'FALSE'LOG` | `'FALSE'LOG` |
| 14 | `{0,6}&{0,8}` | `{0,6}&{0,8}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 3 (0 W / 3 R) |
| Parametres | 5 |
| Variables locales | 5 |
| Expressions | 27 |
| Expressions 100% decodees | 16 (59%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

