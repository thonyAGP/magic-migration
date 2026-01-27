# ADH IDE 123 - Apport coffre

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_123.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 123 |
| **Fichier XML** | Prg_123.xml |
| **Description** | Apport coffre |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 9 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_123.xml. L'ID XML (123) peut differer de la position IDE (123).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-123.yaml`
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
| #232 | `caisse_devise` | gestion_devise_session | **W** | 1x |
| #244 | `caisse_saisie_appro_dev` | saisie_approvisionnement | **W** | 5x |
| #67 | `cafil045_dat` | tables___________tab | R | 2x |
| #141 | `cafil119_dat` | devises__________dev | R | 2x |
| #215 | `caisse_coffre_compcais_devise_histo` | comptage_coffre_devise_histo | R | 1x |

---

## 3. PARAMETRES D'ENTREE (9)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Param societe | ALPHA | - |
| P2 | Param masque montant | ALPHA | - |
| P3 | Param Montant apport | NUMERIC | - |
| P4 | Param devise locale | ALPHA | - |
| P5 | Param quand | ALPHA | - |
| P6 | Param UNI/BI | ALPHA | - |
| P7 | Param Nombre devises apport | NUMERIC | - |
| P8 | Param coffre 2 ouvert | LOGICAL | - |
| P9 | Existe devise à la vente | LOGICAL | - |
| P10 | Fin | LOGICAL | - |

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

> Total: 140 variables mappees

---

## 5. EXPRESSIONS (81 total, 57 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,11}` | `{0,11}` |
| 2 | `{0,6}<>'B'` | `Param Nombre devises apport<>'B'` |
| 3 | `{0,6}='B'` | `Param Nombre devises apport='B'` |
| 4 | `NOT ({0,10})` | `NOT (Fin)` |
| 5 | `{0,10}` | `Fin` |
| 6 | `NOT ({0,8}) AND NOT {0,9}` | `NOT (p.i.Host courant coffre 2 ?) AND NOT Existe devise à...` |
| 7 | `'TRUE'LOG` | `'TRUE'LOG` |
| 8 | `NOT(ExpCalc('6'EXP))` | `NOT(ExpCalc('6'EXP))` |
| 1 | `145` | `145` |
| 2 | `Trim ({0,1})` | `Trim (Param masque montant)` |
| 3 | `{32768,1}` | `VG.USER` |
| 4 | `Date ()` | `Date ()` |
| 5 | `MID (Trim ({1,2}),2,15)` | `MID (Trim ({1,2}),2,15)` |
| 6 | `'&Validation'` | `'&Validation'` |
| 7 | `0` | `0` |
| 8 | `'TRUE'LOG` | `'TRUE'LOG` |
| 9 | `{0,3}` | `Param devise locale` |
| 1 | `'BDEV'` | `'BDEV'` |
| 2 | `{2,4}` | `{2,4}` |
| 3 | `{0,4}` | `Param quand` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `'O'` | `'O'` |
| 3 | `1` | `1` |
| 1 | `145` | `145` |
| 2 | `Trim ({0,1})` | `Trim (Param masque montant)` |
| 3 | `{32768,1}` | `VG.USER` |
| 4 | `Date ()` | `Date ()` |
| 5 | `MID (Trim ({1,2}),2,15)` | `MID (Trim ({1,2}),2,15)` |
| 6 | `'&Validation'` | `'&Validation'` |
| 7 | `'TRUE'LOG` | `'TRUE'LOG` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 5 (2 W / 3 R) |
| Parametres | 9 |
| Variables locales | 11 |
| Expressions | 81 |
| Expressions 100% decodees | 57 (70%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

