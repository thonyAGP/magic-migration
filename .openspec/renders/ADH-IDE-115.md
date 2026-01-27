# ADH IDE 115 - Création des Club Med Pass

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_115.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 115 |
| **Fichier XML** | Prg_115.xml |
| **Description** | Création des Club Med Pass |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 3 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_115.xml. L'ID XML (115) peut differer de la position IDE (115).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-115.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (3 tables -  en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #480 | `%club_user%_caisse_last_session_1` | tempo_caisses_1 | **W** | 2x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #312 | `ezcard` | ez_card | R | 1x |

---

## 3. PARAMETRES D'ENTREE (3)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | p. societe | ALPHA | - |
| P2 | p. code adherent | NUMERIC | - |
| P3 | < solde compte | NUMERIC | - |
| P4 | < etat compte | ALPHA | - |
| P5 | < date solde | DATE | - |
| P6 | < garanti O/N | ALPHA | - |
| P7 | v. nom & prenom | ALPHA | - |
| P8 | N° CMP Existe déjà ? | LOGICAL | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v. nom & prenom | ALPHA | - |
| V.N° CMP Déjà Saisi ? | LOGICAL | - |

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

> Total: 138 variables mappees

---

## 5. EXPRESSIONS (23 total, 10 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,25}` | `{0,25}` |
| 2 | `{0,16}` | `{0,16}` |
| 3 | `Date ()` | `Date ()` |
| 4 | `{32768,2}` | `VG.Retour Chariot` |
| 5 | `{0,1}` | `p. code adherent` |
| 6 | `{0,2}` | `P.Ecran Validé ?` |
| 7 | `Trim ({0,10})&' '&{0,11}` | `Trim ({0,10})&' '&{0,11}` |
| 8 | `IF ({0,21}>0,Str ({0,21},'###'),IF ({0,22}=0,'',Str ({0,2...` | `IF ({0,21}>0,Str ({0,21},'###'),IF ({0,22}=0,'',Str ({0,2...` |
| 9 | `IF ({0,21}>0,'ans',IF ({0,22}=0,'','mois'))` | `IF ({0,21}>0,'ans',IF ({0,22}=0,'','mois'))` |
| 10 | `'-'` | `'-'` |
| 11 | `IF ({0,20}<Date (),MlsTrans ('dernier sejour :'),IF ({0,1...` | `IF ({0,20}<Date (),MlsTrans ('dernier sejour :'),IF ({0,1...` |
| 12 | `MlsTrans ('du')` | `MlsTrans ('du')` |
| 13 | `MlsTrans ('au')` | `MlsTrans ('au')` |
| 14 | `{0,16}=0` | `{0,16}=0` |
| 15 | `Len(Trim({0,24}))<10` | `Len(Trim({0,24}))<10` |
| 16 | `{0,24}<>''` | `{0,24}<>''` |
| 17 | `{0,24}` | `{0,24}` |
| 18 | `NOT({0,25})` | `NOT({0,25})` |
| 19 | `'TRUE'LOG` | `'TRUE'LOG` |
| 20 | `CtrlGoto ('N° Club Med Pass',1,0)` | `CtrlGoto ('N° Club Med Pass',1,0)` |
| 1 | `Trim({1,24})` | `Trim({1,24})` |
| 2 | `{0,2}<>{1,16}` | `P.Ecran Validé ?<>{1,16}` |
| 3 | `'TRUE'LOG` | `'TRUE'LOG` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 3 ( W / 2 R) |
| Parametres | 3 |
| Variables locales | 10 |
| Expressions | 23 |
| Expressions 100% decodees | 10 (43%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

