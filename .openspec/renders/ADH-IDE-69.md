# ADH IDE 69 - Extrait de compte

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_69.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 69 |
| **Fichier XML** | Prg_69.xml |
| **Description** | Extrait de compte |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 12 |
| **Module** | ADH |
| **Dossier IDE** | Extrait de Compte |

> **Note**: Ce programme est Prg_69.xml. L'ID XML (69) peut differer de la position IDE (69).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
- **Qui**: Operateur caisse / Reception
- **Quoi**: Generer un extrait de compte pour un adherent
- **Pourquoi**: Permettre consultation et impression des mouvements financiers du compte
### 1.2 Flux Utilisateur
1. Saisie ou selection du compte adherent (societe + code + filiation)
2. Selection des criteres de filtre (dates, services)
3. Affichage liste des mouvements avec cumul progressif
4. Option impression extrait
5. Retour au menu ou nouveau extrait

### 1.3 Notes Migration
- Query simple - lecture seule sur operations
- Calcul cumul progressif cote application
- Integration avec EXTRAIT_IMP (IDE 73) pour impression

### 1.4 Dependances ECF

PARTAGE via ADH.ecf (Sessions_Reprises) - Appele depuis PBP et PVE

### 1.5 Tags
`extrait``, ``ecf-shared``, ``cross-project``, ``compte-adherent`

---

## 2. TABLES (15 tables - 4 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #40 | `cafil018_dat` | comptable________cte | **W** | 3x |
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 3x |
| #367 | `pmsprintparamdefault` | pms_print_param_default | **W** | 1x |
| #911 | `log_booker` | log_booker | **W** | 1x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #67 | `cafil045_dat` | tables___________tab | R | 1x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 1x |
| #285 | `email` | email | R | 1x |
| #377 | `pv_contracts_dat` | pv_contracts | R | 1x |
| #395 | `pv_ownership_dat` | pv_ownership | R | 1x |
| #396 | `pv_packages_dat` | pv_cust_packages | R | 2x |
| #473 | `%club_user%_caisse_compcais` | comptage_caisse | R | 1x |
| #728 | `arc_cctotal` | arc_cc_total | R | 1x |
| #786 | `qualite_avant_reprise` | qualite_avant_reprise | R | 1x |
| #945 | `Table_945` | Unknown | R | 2x |

---

## 3. PARAMETRES D'ENTREE (12)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | > societe | ALPHA | - |
| P2 | > code_retour | ALPHA | - |
| P3 | > code_adherent | NUMERIC | - |
| P4 | > filiation | NUMERIC | - |
| P5 | > masque mtt | ALPHA | - |
| P6 | > nom village | ALPHA | - |
| P7 | < solde compte | NUMERIC | - |
| P8 | < etat compte | ALPHA | - |
| P9 | < date solde | DATE | - |
| P10 | < garanti O/N | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Ref | Nom | Type | Role |
|-----|-----|------|------|
| `{0,-93}` | W0 Presence Recap Free Extra | LOGICAL | - |
| `{0,-92}` | W0 Print Recap Free Extra | LOGICAL | - |
| `{0,-89}` | W0 Mail Existe | LOGICAL | - |

### 4.2 Variables globales (VG)

| Ref | Decode | Role |
|-----|--------|------|
| `{32768,0}` | VG.LOGIN | - |
| `{32768,1}` | VG.USER | - |
| `{32768,2}` | VG.Retour Chariot | - |
| `{32768,3}` | VG.DROIT ACCES IT ? | - |
| `{32768,4}` | VG.DROIT ACCES CAISSE ? | - |
| `{32768,5}` | VG.BRAZIL DATACATCHING? | - |
| `{32768,6}` | VG.USE MDR | - |
| `{32768,7}` | VG.VRL ACTIF ? | - |
| `{32768,8}` | VG.ECI ACTIF ? | - |
| `{32768,9}` | VG.COMPTE CASH ACTIF ? | - |
| `{32768,10}` | VG.IND SEJ PAYE ACTIF ? | - |
| `{32768,11}` | VG.CODE LANGUE USER | - |
| `{32768,12}` | VG.EFFECTIF ACTIF ? | - |
| `{32768,13}` | VG.TAXE SEJOUR ACTIF ? | - |
| `{32768,14}` | VG.N° version | - |

> Total: 148 variables mappees

---

## 5. EXPRESSIONS (188 total, 98 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,1}=''` | `> code_retour=''` |
| 2 | `'C'` | `'C'` |
| 3 | `{0,1}` | `> code_retour` |
| 4 | `{0,3}` | `> filiation` |
| 5 | `{0,4}` | `> masque mtt` |
| 6 | `NOT {0,11}` | `NOT >P.ViensDe` |
| 7 | `{0,11}` | `>P.ViensDe` |
| 8 | `{32768,37}` | `VG.VG FREE EXTRA` |
| 9 | `'TRUE'LOG` | `'TRUE'LOG` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,3}` | `{1,3}` |
| 3 | `1` | `1` |
| 4 | `{0,5}+{0,3}` | `> nom village+> filiation` |
| 1 | `{2,1}` | `{2,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{1,5}` | `{1,5}` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,3}` | `{1,3}` |
| 3 | `IF ({1,18},{1,14},'01/01/1900'DATE)` | `IF ({1,18},{1,14},'01/01/1900'DATE)` |
| 4 | `IF ({1,18},{1,14},'01/01/2900'DATE)` | `IF ({1,18},{1,14},'01/01/2900'DATE)` |
| 6 | `{0,4}<>0` | `> masque mtt<>0` |
| 7 | `'TRUE'LOG` | `'TRUE'LOG` |
| 1 | `IF ({1,18},{1,14},'01/01/1900'DATE)` | `IF ({1,18},{1,14},'01/01/1900'DATE)` |
| 2 | `IF ({1,18},{1,14},'01/01/2900'DATE)` | `IF ({1,18},{1,14},'01/01/2900'DATE)` |
| 3 | `Trim ({0,73})` | `Trim ({0,73})` |
| 4 | `Date ()` | `Date ()` |
| 5 | `{32768,2}` | `VG.Retour Chariot` |
| 6 | `{1,1}` | `{1,1}` |
| 7 | `{1,3}` | `{1,3}` |
| 8 | `{0,3}` | `> filiation` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 15 (4 W / 11 R) |
| Parametres | 12 |
| Variables locales | 15 |
| Expressions | 188 |
| Expressions 100% decodees | 98 (52%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

