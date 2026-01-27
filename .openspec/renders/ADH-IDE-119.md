# ADH IDE 119 - Affichage sessions

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_119.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 119 |
| **Fichier XML** | Prg_119.xml |
| **Description** | Affichage sessions |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 7 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_119.xml. L'ID XML (119) peut differer de la position IDE (119).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-119.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (5 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #67 | `cafil045_dat` | tables___________tab | R | 2x |
| #246 | `caisse_session` | histo_sessions_caisse | R | 2x |
| #249 | `caisse_session_detail` | histo_sessions_caisse_detail | R | 2x |
| #372 | `pv_budget_dat` | pv_budget | R | 2x |
| #734 | `arc_pv_packages_dat` | arc_pv_cust_packages | R | 2x |

---

## 3. PARAMETRES D'ENTREE (7)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Param Visu/Cloture | ALPHA | - |
| P2 | Param societe | ALPHA | - |
| P3 | Param devise locale | ALPHA | - |
| P4 | Param Masque montant | ALPHA | - |
| P5 | Param date comptable | DATE | - |
| P6 | Param autorisation clôture | LOGICAL | - |
| P7 | Param abandon | LOGICAL | - |
| P8 | Fin | LOGICAL | - |
| P9 | Etat | ALPHA | - |
| P10 | Existe session | LOGICAL | - |
| P11 | Existe session ouverte | LOGICAL | - |
| P12 | Faire Update suivi PDC | LOGICAL | - |

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

> Total: 142 variables mappees

---

## 5. EXPRESSIONS (155 total, 85 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,8}` | `Etat` |
| 2 | `{0,9}=''` | `Existe session=''` |
| 3 | `{0,9}='O'` | `Existe session='O'` |
| 4 | `{0,10}` | `Existe session ouverte` |
| 5 | `NOT ({0,10})` | `NOT (Existe session ouverte)` |
| 6 | `{0,11}` | `Faire Update suivi PDC` |
| 7 | `NOT ({0,11})` | `NOT (Faire Update suivi PDC)` |
| 8 | `NOT {32768,78}` | `NOT VG.Hostname au lieu de Term` |
| 9 | `{32768,78}` | `VG.Hostname au lieu de Term` |
| 1 | `159` | `159` |
| 2 | `Trim ({0,53})` | `Trim ({0,53})` |
| 3 | `{1,1}='C'` | `{1,1}='C'` |
| 4 | `{1,1}='V'` | `{1,1}='V'` |
| 5 | `0` | `0` |
| 6 | `{32768,1}` | `VG.USER` |
| 7 | `Date ()` | `Date ()` |
| 8 | `'TRUE'LOG` | `'TRUE'LOG` |
| 9 | `IF ({0,5}=0,'Ouverte','Fermee')` | `IF (Param autorisation clôture=0,'Ouverte','Fermee')` |
| 10 | `IF ({0,5}=0,144,110)` | `IF (Param autorisation clôture=0,144,110)` |
| 11 | `CndRange ({1,9}='O',0)` | `CndRange ({1,9}='O',0)` |
| 12 | `{1,9}='' AND {0,1}<>''` | `{1,9}='' AND Param societe<>''` |
| 13 | `MlsTrans ('Sessions ouvertes')` | `MlsTrans ('Sessions ouvertes')` |
| 14 | `{1,9}='O'` | `{1,9}='O'` |
| 15 | `{0,1}` | `Param societe` |
| 16 | `{0,2}` | `Param devise locale` |
| 17 | `1` | `1` |
| 18 | `'D'` | `'D'` |
| 19 | `'O'` | `'O'` |
| 20 | `'F'` | `'F'` |
| 21 | `LastClicked ()='EO' AND {0,8}` | `LastClicked ()='EO' AND Etat` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 5 (0 W / 5 R) |
| Parametres | 7 |
| Variables locales | 12 |
| Expressions | 155 |
| Expressions 100% decodees | 85 (55%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

