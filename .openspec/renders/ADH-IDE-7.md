# ADH IDE 7 - Menu Data Catching

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_7.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 7 |
| **Fichier XML** | Prg_7.xml |
| **Description** | Menu Data Catching |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 0 |
| **Module** | ADH |
| **Dossier IDE** | Brazil DataCatching |

> **Note**: Ce programme est Prg_7.xml. L'ID XML (7) peut differer de la position IDE (7).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-7.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (13 tables - 6 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #22 | `cafil_address_ec` | address_data_catching | **W** | 5x |
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 5x |
| #312 | `ezcard` | ez_card | **W** | 1x |
| #781 | `log_affec_auto_entete` | log_affec_auto_entete | **W** | 1x |
| #783 | `vrl_hp` | vrl_hp | **W** | 6x |
| #785 | `effectif_quotidien` | effectif_quotidien | **W** | 5x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 4x |
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 6x |
| #34 | `cafil012_dat` | hebergement______heb | R | 3x |
| #40 | `cafil018_dat` | comptable________cte | R | 2x |
| #780 | `log_affec_auto_detail` | log_affec_auto_detail | R | 1x |
| #784 | `type_repas_nenc_vill` | type_repas_nenc_vill | R | 2x |
| #786 | `qualite_avant_reprise` | qualite_avant_reprise | R | 1x |

---

## 3. PARAMETRES D'ENTREE (0)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | v.no exit | LOGICAL | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.no exit | LOGICAL | - |

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

## 5. EXPRESSIONS (502 total, 86 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{32768,79}` | `VG.Numéro pseudo terminal` |
| 2 | `SetParam ('LANGUAGE','ENG')` | `SetParam ('LANGUAGE','ENG')` |
| 3 | `NOT ({0,1})` | `NOT ({0,1})` |
| 4 | `NOT ({0,3})` | `NOT ({0,3})` |
| 5 | `'FALSE'LOG` | `'FALSE'LOG` |
| 1 | `{0,9}<>0` | `{0,9}<>0` |
| 2 | `'C'` | `'C'` |
| 3 | `IF (GetParam ('LANGUAGE')='SPA','{0,4}'FORM,IF (GetParam ...` | `IF (GetParam ('LANGUAGE')='SPA','{0,4}'FORM,IF (GetParam ...` |
| 4 | `'ENG'` | `'ENG'` |
| 5 | `'FALSE'LOG` | `'FALSE'LOG` |
| 6 | `{0,18}=1` | `{0,18}=1` |
| 7 | `NOT ({0,16})` | `NOT ({0,16})` |
| 8 | `{0,9}<>0` | `{0,9}<>0` |
| 9 | `{0,18}=2` | `{0,18}=2` |
| 10 | `{0,18}=3` | `{0,18}=3` |
| 11 | `{0,18}=4` | `{0,18}=4` |
| 12 | `{0,18}=9` | `{0,18}=9` |
| 13 | `{0,9}<>0` | `{0,9}<>0` |
| 14 | `1` | `1` |
| 1 | `Val (LastClicked (),'1')` | `Val (LastClicked (),'1')` |
| 1 | `SetParam ('LANGUAGE',LastClicked ())` | `SetParam ('LANGUAGE',LastClicked ())` |
| 2 | `LastClicked ()` | `LastClicked ()` |
| 3 | `'TRUE'LOG` | `'TRUE'LOG` |
| 1 | `'Print police form for this person'` | `'Print police form for this person'` |
| 2 | `'Print police form for this account (including filiations)'` | `'Print police form for this account (including filiations)'` |
| 3 | `'Print police form for the entire list'` | `'Print police form for the entire list'` |
| 4 | `'FALSE'LOG` | `'FALSE'LOG` |
| 5 | `{1,13}` | `{1,13}` |
| 6 | `{1,14}` | `{1,14}` |
| 7 | `2` | `2` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 13 (6 W / 7 R) |
| Parametres | 0 |
| Variables locales | 1 |
| Expressions | 502 |
| Expressions 100% decodees | 86 (17%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

