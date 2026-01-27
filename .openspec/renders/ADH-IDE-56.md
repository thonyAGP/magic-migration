# ADH IDE 56 - Récap Trait Easy Check-Out

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_56.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 56 |
| **Fichier XML** | Prg_56.xml |
| **Description** | Récap Trait Easy Check-Out |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 0 |
| **Module** | ADH |
| **Dossier IDE** | Easy Check Out |

> **Note**: Ce programme est Prg_56.xml. L'ID XML (56) peut differer de la position IDE (56).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-56.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (6 tables -  en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #934 | `selection_enregistrement_div` | selection enregistrement diver | **W** | 2x |
| #34 | `cafil012_dat` | hebergement______heb | R | 2x |
| #39 | `cafil017_dat` | depot_garantie___dga | R | 2x |
| #47 | `cafil025_dat` | compte_gm________cgm | R | 2x |
| #48 | `cafil026_dat` | lignes_de_solde__sld | R | 2x |
| #372 | `pv_budget_dat` | pv_budget | R | 1x |

---

## 3. PARAMETRES D'ENTREE (0)

| # | Nom | Type | Description |
|---|-----|------|-------------|

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.Deja edité ? | LOGICAL | - |
| v.Reponse | NUMERIC | - |
| v.Erreurs seules | LOGICAL | - |

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

## 5. EXPRESSIONS (32 total, 19 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `'Quitter'` | `'Quitter'` |
| 2 | `'Imprimer'` | `'Imprimer'` |
| 3 | `Date()` | `Date()` |
| 4 | `'C'` | `'C'` |
| 5 | `{0,2}` | `v.Deja edité ?` |
| 6 | `{0,3}` | `v.Reponse` |
| 7 | `'Z'` | `'Z'` |
| 8 | `IF({0,11}<>0,179,174)` | `IF({0,11}<>0,179,174)` |
| 9 | `NOT {0,6}` | `NOT {0,6}` |
| 10 | `{0,29}` | `{0,29}` |
| 11 | `{0,30}=6` | `{0,30}=6` |
| 12 | `{32768,22}` | `VG.MASQUE MONTANT` |
| 13 | `'FALSE'LOG` | `'FALSE'LOG` |
| 1 | `'TRUE'LOG` | `'TRUE'LOG` |
| 2 | `Date()` | `Date()` |
| 3 | `Translate('%club_exportdata%')&'Easy_Check_Out\EASY_CHECK...` | `Translate('%club_exportdata%')&'Easy_Check_Out\EASY_CHECK...` |
| 4 | `'C'` | `'C'` |
| 5 | `{0,2}` | `v.Deja edité ?` |
| 6 | `{0,3}` | `v.Reponse` |
| 7 | `'Z'` | `'Z'` |
| 8 | `{32768,22}` | `VG.MASQUE MONTANT` |
| 9 | `{32768,44}` | `VG.VG_FAX_VISIBLE` |
| 10 | `CndRange({1,31}='TRUE'LOG,'FALSE'LOG)` | `CndRange({1,31}='TRUE'LOG,'FALSE'LOG)` |
| 11 | `NOT {0,6}` | `NOT {0,6}` |
| 12 | `Trim({0,17})` | `Trim({0,17})` |
| 13 | `Trim({0,22})` | `Trim({0,22})` |
| 14 | `Date()` | `Date()` |
| 15 | `{0,35}+{0,33}` | `{0,35}+{0,33}` |
| 16 | `{0,36}+{0,33}` | `{0,36}+{0,33}` |
| 17 | `{0,34}='VISA'` | `{0,34}='VISA'` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 6 ( W / 5 R) |
| Parametres | 0 |
| Variables locales | 5 |
| Expressions | 32 |
| Expressions 100% decodees | 19 (59%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

