# ADH IDE 82 -    Select affilies

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_82.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 82 |
| **Fichier XML** | Prg_82.xml |
| **Description** |    Select affilies |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 4 |
| **Module** | ADH |
| **Dossier IDE** | EzCard |

> **Note**: Ce programme est Prg_82.xml. L'ID XML (82) peut differer de la position IDE (82).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-82.yaml`
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
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #47 | `cafil025_dat` | compte_gm________cgm | R | 1x |
| #312 | `ezcard` | ez_card | R | 1x |

---

## 3. PARAMETRES D'ENTREE (4)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | p. societe | ALPHA | - |
| P2 | p. code adherent | NUMERIC | - |
| P3 | p. filiation | NUMERIC | - |
| P4 | p.flag ok | LOGICAL | - |
| P5 | < solde compte | NUMERIC | - |
| P6 | < etat compte | ALPHA | - |
| P7 | < date solde | DATE | - |
| P8 | < garanti O/N | ALPHA | - |
| P9 | v. titre | ALPHA | - |
| P10 | v. nom & prenom | ALPHA | - |
| P11 | r.EZ card | LOGICAL | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v. titre | ALPHA | - |
| v. nom & prenom | ALPHA | - |

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

## 5. EXPRESSIONS (33 total, 20 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `IF ({0,25},143,110)` | `IF ({0,25},143,110)` |
| 2 | `NOT ({0,25})` | `NOT ({0,25})` |
| 3 | `NOT ({0,25})` | `NOT ({0,25})` |
| 4 | `{0,25}` | `{0,25}` |
| 5 | `{0,18}` | `{0,18}` |
| 6 | `'TRUE'LOG` | `'TRUE'LOG` |
| 7 | `{0,1}=''` | `p. code adherent=''` |
| 8 | `'C'` | `'C'` |
| 9 | `Trim ({0,9})` | `Trim (v. nom & prenom)` |
| 10 | `Date ()` | `Date ()` |
| 11 | `{32768,2}` | `VG.Retour Chariot` |
| 12 | `{0,1}` | `p. code adherent` |
| 13 | `{0,2}` | `p. filiation` |
| 14 | `{0,18}` | `{0,18}` |
| 15 | `'V'` | `'V'` |
| 16 | `Stat (0,'C'MODE)` | `Stat (0,'C'MODE)` |
| 17 | `Trim ({0,12})&' '&{0,13}` | `Trim ({0,12})&' '&{0,13}` |
| 18 | `IF ({0,23}>0,Str ({0,23},'###'),IF ({0,24}=0,'',Str ({0,2...` | `IF ({0,23}>0,Str ({0,23},'###'),IF ({0,24}=0,'',Str ({0,2...` |
| 19 | `IF ({0,23}>0,'ans',IF ({0,24}=0,'','mois'))` | `IF ({0,23}>0,'ans',IF ({0,24}=0,'','mois'))` |
| 20 | `'-'` | `'-'` |
| 21 | `IF ({0,22}<Date (),MlsTrans ('dernier sejour :'),IF ({0,2...` | `IF ({0,22}<Date (),MlsTrans ('dernier sejour :'),IF ({0,2...` |
| 22 | `MlsTrans ('du')` | `MlsTrans ('du')` |
| 23 | `MlsTrans ('au')` | `MlsTrans ('au')` |
| 24 | `1` | `1` |
| 25 | `{0,18}=0` | `{0,18}=0` |
| 26 | `'FALSE'LOG` | `'FALSE'LOG` |
| 27 | `NOT(Stat(0,'M'MODE))` | `NOT(Stat(0,'M'MODE))` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{0,3}` | `p.flag ok` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 3 (0 W / 3 R) |
| Parametres | 4 |
| Variables locales | 11 |
| Expressions | 33 |
| Expressions 100% decodees | 20 (61%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

