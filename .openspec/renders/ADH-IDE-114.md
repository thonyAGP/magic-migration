# ADH IDE 114 - Club Med Pass Filiations

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_114.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 114 |
| **Fichier XML** | Prg_114.xml |
| **Description** | Club Med Pass Filiations |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 4 |
| **Module** | ADH |
| **Dossier IDE** | Garantie |

> **Note**: Ce programme est Prg_114.xml. L'ID XML (114) peut differer de la position IDE (114).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-114.yaml`
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
| #312 | `ezcard` | ez_card | **W** | 2x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #47 | `cafil025_dat` | compte_gm________cgm | R | 1x |

---

## 3. PARAMETRES D'ENTREE (4)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | v. nom & prenom | ALPHA | - |
| P2 | N° CMP Existe déjà ? | LOGICAL | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v. nom & prenom | ALPHA | - |
| v.num cmp | UNICODE | - |
| v.var change en cours | LOGICAL | - |
| v.confirmation | NUMERIC | - |

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

## 5. EXPRESSIONS (36 total, 17 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `Date ()` | `Date ()` |
| 2 | `{32768,2}` | `VG.Retour Chariot` |
| 3 | `{0,1}` | `P.Compte` |
| 4 | `{0,2}` | `v. nom & prenom` |
| 5 | `Trim ({0,5})&' '&{0,6}` | `Trim (v.var change en cours)&' '&CHG_REASON_v.num cmp` |
| 6 | `IF ({0,16}>0,Str ({0,16},'###'),IF ({0,17}=0,'',Str ({0,1...` | `IF ({0,16}>0,Str ({0,16},'###'),IF ({0,17}=0,'',Str ({0,1...` |
| 7 | `IF ({0,16}>0,'ans',IF ({0,17}=0,'','mois'))` | `IF ({0,16}>0,'ans',IF ({0,17}=0,'','mois'))` |
| 8 | `'-'` | `'-'` |
| 9 | `IF ({0,15}<Date (),MlsTrans ('dernier sejour :'),IF ({0,1...` | `IF ({0,15}<Date (),MlsTrans ('dernier sejour :'),IF ({0,1...` |
| 10 | `MlsTrans ('du')` | `MlsTrans ('du')` |
| 11 | `MlsTrans ('au')` | `MlsTrans ('au')` |
| 12 | `{0,11}=0` | `{0,11}=0` |
| 13 | `{0,19} AND ({0,4}*1000+{0,11}<>{0,22}*1000+{0,23} OR {0,2...` | `{0,19} AND (N° CMP Existe déjà ?*1000+{0,11}<>{0,22}*1000...` |
| 14 | `{0,18}` | `{0,18}` |
| 15 | `'TRUE'LOG` | `'TRUE'LOG` |
| 16 | `CallProg('{160,-1}'PROG,{0,3},{0,4},{0,11})` | `CallProg('{160,-1}'PROG,v.num cmp,N° CMP Existe déjà ?,{0...` |
| 17 | `{0,30}` | `{0,30}` |
| 18 | `'FALSE'LOG` | `'FALSE'LOG` |
| 19 | `Trim({0,30})<>'' AND Trim({0,30})<>Trim({0,18})` | `Trim({0,30})<>'' AND Trim({0,30})<>Trim({0,18})` |
| 20 | `1` | `1` |
| 21 | `Trim({0,30})='' AND Trim({0,18})<>''` | `Trim({0,30})='' AND Trim({0,18})<>''` |
| 22 | `IF(Trim({0,30})<>'' AND Trim({0,30})<>Trim({0,18}) AND {0...` | `IF(Trim({0,30})<>'' AND Trim({0,30})<>Trim({0,18}) AND {0...` |
| 23 | `{0,31}=1` | `{0,31}=1` |
| 24 | `{0,31}<>1` | `{0,31}<>1` |
| 25 | `NOT({0,25})` | `NOT({0,25})` |
| 1 | `{1,3}` | `{1,3}` |
| 2 | `{1,4}` | `{1,4}` |
| 3 | `{1,11}` | `{1,11}` |
| 4 | `{1,18}` | `{1,18}` |
| 5 | `IF({32768,74},IF({1,28}='O','V','I'),'V')` | `IF(VG.Identification CM Pass,IF({1,28}='O','V','I'),'V')` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 3 ( W / 2 R) |
| Parametres | 4 |
| Variables locales | 9 |
| Expressions | 36 |
| Expressions 100% decodees | 17 (47%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

