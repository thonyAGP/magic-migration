# ADH IDE 167 - Liste des affiliés

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_166.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 167 |
| **Fichier XML** | Prg_166.xml |
| **Description** | Liste des affiliés |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 7 |
| **Module** | ADH |
| **Dossier IDE** | Operations GM |

> **Note**: Ce programme est Prg_166.xml. L'ID XML (166) peut differer de la position IDE (167).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-167.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (2 tables - 0 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #47 | `cafil025_dat` | compte_gm________cgm | R | 1x |

---

## 3. PARAMETRES D'ENTREE (7)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | > societe | ALPHA | - |
| P2 | > code adherent | NUMERIC | - |
| P3 | > filiation | NUMERIC | - |
| P4 | < solde compte | NUMERIC | - |
| P5 | < etat compte | ALPHA | - |
| P6 | < date solde | DATE | - |
| P7 | < garanti O/N | ALPHA | - |
| P8 | v. titre | ALPHA | - |
| P9 | v. nom & prenom | ALPHA | - |

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

> Total: 136 variables mappees

---

## 5. EXPRESSIONS (24 total, 17 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,1}=''` | `> code adherent=''` |
| 2 | `'C'` | `'C'` |
| 3 | `Trim ({0,8})` | `Trim (v. nom & prenom)` |
| 4 | `Date ()` | `Date ()` |
| 5 | `{32768,2}` | `VG.Retour Chariot` |
| 6 | `{0,1}` | `> code adherent` |
| 7 | `{0,2}` | `> filiation` |
| 8 | `Stat (0,'C'MODE)` | `Stat (0,'C'MODE)` |
| 9 | `Trim ({0,11})&' '&{0,12}` | `Trim ({0,11})&' '&{0,12}` |
| 10 | `IF ({0,22}>0,Str ({0,22},'###'),IF ({0,23}=0,'',Str ({0,2...` | `IF ({0,22}>0,Str ({0,22},'###'),IF ({0,23}=0,'',Str ({0,2...` |
| 11 | `IF ({0,22}>0,'ans',IF ({0,23}=0,'','mois'))` | `IF ({0,22}>0,'ans',IF ({0,23}=0,'','mois'))` |
| 12 | `'-'` | `'-'` |
| 13 | `IF ({0,21}<Date (),MlsTrans ('dernier sejour :'),IF ({0,2...` | `IF ({0,21}<Date (),MlsTrans ('dernier sejour :'),IF ({0,2...` |
| 14 | `MlsTrans ('du')` | `MlsTrans ('du')` |
| 15 | `MlsTrans ('au')` | `MlsTrans ('au')` |
| 16 | `1` | `1` |
| 17 | `{0,17}=0` | `{0,17}=0` |
| 18 | `NOT(Stat(0,'M'MODE))` | `NOT(Stat(0,'M'MODE))` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{0,3}` | `< solde compte` |
| 4 | `{0,4}` | `< etat compte` |
| 5 | `{0,5}` | `< date solde` |
| 6 | `IF ({0,3}='S',{0,7},{0,6})` | `IF (< solde compte='S',v. titre,< garanti O/N)` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 2 (0 W / 2 R) |
| Parametres | 7 |
| Variables locales | 9 |
| Expressions | 24 |
| Expressions 100% decodees | 17 (71%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

