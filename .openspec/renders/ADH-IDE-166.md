# ADH IDE 166 - Start

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_165.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 166 |
| **Fichier XML** | Prg_165.xml |
| **Description** | Start |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 0 |
| **Module** | ADH |
| **Dossier IDE** | Menus |

> **Note**: Ce programme est Prg_165.xml. L'ID XML (165) peut differer de la position IDE (166).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-166.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (8 tables -  en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #878 | `categorie_operation_mw` | categorie_operation_mw | **W** | 2x |
| #67 | `cafil045_dat` | tables___________tab | R | 1x |
| #69 | `cafil047_dat` | initialisation___ini | R | 1x |
| #81 | `cafil059_dat` | societe__________soc | R | 1x |
| #118 | `cafil096_dat` | tables_imports | R | 1x |
| #219 | `caisse_com_ims` | communication_ims | R | 1x |
| #728 | `arc_cctotal` | arc_cc_total | R | 1x |
| #740 | `pv_stockmvt_dat` | pv_stock_movements | R | 1x |

---

## 3. PARAMETRES D'ENTREE (0)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | W0 connection ? | LOGICAL | - |
| P2 | FROM_IMS | ALPHA | - |
| P3 | L Contrôle date OK | LOGICAL | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0 connection ? | LOGICAL | - |
| v.Tpt_interface ? | LOGICAL | - |
| v.Code TPE | UNICODE | - |

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

## 5. EXPRESSIONS (59 total, 52 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `SetParam ('VERIF_USERB','O')` | `SetParam ('VERIF_USERB','O')` |
| 2 | `{0,1}` | `FROM_IMS` |
| 3 | `IF({0,8}<>0,'N11.'&Trim(Str({0,8},'#'))&'CZ','N13CZ')` | `IF({0,8}<>0,'N11.'&Trim(Str({0,8},'#'))&'CZ','N13CZ')` |
| 4 | `NOT ({0,1}) AND NOT(IsComponent())` | `NOT (FROM_IMS) AND NOT(IsComponent())` |
| 5 | `SetParam ('SPECIFICPRINT','VOID')` | `SetParam ('SPECIFICPRINT','VOID')` |
| 6 | `SetParam ('CURRENTPRINTERNUM',0)` | `SetParam ('CURRENTPRINTERNUM',0)` |
| 7 | `SetParam ('CURRENTPRINTERNAME','VOID')` | `SetParam ('CURRENTPRINTERNAME','VOID')` |
| 8 | `SetParam ('NUMBERCOPIES',0)` | `SetParam ('NUMBERCOPIES',0)` |
| 9 | `SetParam ('LISTINGNUMPRINTERCHOICE',0)` | `SetParam ('LISTINGNUMPRINTERCHOICE',0)` |
| 10 | `SetParam ('CHAINEDLISTING','NO')` | `SetParam ('CHAINEDLISTING','NO')` |
| 11 | `NOT ({32768,4} OR IsComponent() OR INIGet ('[MAGIC_LOGICA...` | `NOT (VG.DROIT ACCES CAISSE ? OR IsComponent() OR INIGet (...` |
| 12 | `Trim(INIGet('[MAGIC_LOGICAL_NAMES]RunMode'))<>'B'` | `Trim(INIGet('[MAGIC_LOGICAL_NAMES]RunMode'))<>'B'` |
| 13 | `'CA'` | `'CA'` |
| 14 | `{32768,17}` | `VG.CALCUL EFFECTIF 2 ACTIF?` |
| 15 | `{32768,23}` | `VG.PROJ.INTERF.TPE ACTIF` |
| 16 | `{0,4}` | `v.Code TPE` |
| 17 | `Trim({0,5})` | `Trim({0,5})` |
| 18 | `{32768,8}` | `VG.ECI ACTIF ?` |
| 19 | `NOT(IsComponent())` | `NOT(IsComponent())` |
| 30 | `NOT(IsComponent()) AND {32768,111} AND Range(Term(),430,450)` | `NOT(IsComponent()) AND VG. Interface Galaxy Grèce AND Ran...` |
| 20 | `'cmd /c mkdir '&Translate('%club_exportdata%')&'Easy_Chec...` | `'cmd /c mkdir '&Translate('%club_exportdata%')&'Easy_Chec...` |
| 21 | `NOT(FileExist(Translate('%club_exportdata%')&'Easy_Check_...` | `NOT(FileExist(Translate('%club_exportdata%')&'Easy_Check_...` |
| 22 | `MnuShow('ID_CMP',{32768,3} OR {32768,74})` | `MnuShow('ID_CMP',VG.DROIT ACCES IT ? OR VG.Identification...` |
| 23 | `Val({0,10}, '3')` | `Val({0,10}, '3')` |
| 24 | `NOT {32768,78}` | `NOT VG.Hostname au lieu de Term` |
| 25 | `{32768,78}` | `VG.Hostname au lieu de Term` |
| 26 | `'BDEV'` | `'BDEV'` |
| 27 | `{0,7}` | `{0,7}` |
| 28 | `Str({0,13},'3')` | `Str({0,13},'3')` |
| 29 | `{0,6}` | `{0,6}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 8 ( W / 7 R) |
| Parametres | 0 |
| Variables locales | 5 |
| Expressions | 59 |
| Expressions 100% decodees | 52 (88%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

