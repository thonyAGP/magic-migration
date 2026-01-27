# ADH IDE 248 - Choix PYR (plusieurs chambres)

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-26
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_244.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 248 |
| **Fichier XML** | Prg_244.xml |
| **Description** | Choix PYR (plusieurs chambres) |
| **Type** | O (O=Online, B=Batch) |
| **Parametres** | 4 |
| **Module** | ADH |
| **Dossier IDE** | Ventes |

> **Note**: Ce programme est Prg_244.xml. L'ID XML (244) peut differer de la position IDE (248).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-248.yaml`
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
| #34 | `cafil012_dat` | hebergement______heb | **W** | 2x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #36 | `cafil014_dat` | client_gm | R | 1x |

---

## 3. PARAMETRES D'ENTREE (4)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | p.Societe | UNICODE | - |
| P2 | p.Compte | NUMERIC | - |
| P3 | p.Nb Chambres | NUMERIC | - |
| P4 | p.PYR Finalisé | LOGICAL | - |
| P5 | gmr_nom__30_ | UNICODE | - |
| P6 | gmr_prenom__8_ | UNICODE | - |
| P7 | gmr_debut_sejour | ALPHA | - |
| P8 | gmr_fin_sejour | ALPHA | - |
| P9 | heb_nom_logement | UNICODE | - |
| P10 | heb_code_logement | UNICODE | - |
| P11 | heb_filiation | NUMERIC | - |
| P12 | v.gestion communicante | LOGICAL | - |
| P13 | v.chambre communicante | UNICODE | - |
| P14 | v.liste chambres | UNICODE | - |
| P15 | v.erreur message | ALPHA | - |
| P16 | v.nb chambres affectées | NUMERIC | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.gestion communicante | LOGICAL | - |
| v.chambre communicante | UNICODE | - |
| v.liste chambres | UNICODE | - |
| v.erreur message | ALPHA | - |
| v.nb chambres affectées | NUMERIC | - |

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

> Total: 150 variables mappees

---

## 5. EXPRESSIONS (45 total, 31 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `DVal({0,7},'YYYYMMDD')` | `DVal(gmr_fin_sejour,'YYYYMMDD')` |
| 2 | `DVal({0,8},'YYYYMMDD')` | `DVal(heb_nom_logement,'YYYYMMDD')` |
| 3 | `DVal({0,7},'YYYYMMDD')+1` | `DVal(gmr_fin_sejour,'YYYYMMDD')+1` |
| 4 | `DVal({0,8},'YYYYMMDD')-1` | `DVal(heb_nom_logement,'YYYYMMDD')-1` |
| 5 | `Date()` | `Date()` |
| 6 | `Range(InStr({0,10},'+'),2,Len(Trim({0,10}))-1) AND Trim({...` | `Range(InStr(heb_filiation,'+'),2,Len(Trim(heb_filiation))...` |
| 7 | `Trim({0,14})=''` | `Trim(v.erreur message)=''` |
| 8 | `Trim({0,9})&','&Trim({0,13})` | `Trim(heb_code_logement)&','&Trim(v.liste chambres)` |
| 9 | `{0,12} AND Trim({0,14})=''` | `v.chambre communicante AND Trim(v.erreur message)=''` |
| 10 | `{0,12} AND LastClicked()='heb_nom_logement'` | `v.chambre communicante AND LastClicked()='heb_nom_logement'` |
| 11 | `'FALSE'LOG` | `'FALSE'LOG` |
| 12 | `''` | `''` |
| 13 | `NOT({0,12}) OR NOT(Range(InStr({0,10},'+'),2,Len(Trim({0,...` | `NOT(v.chambre communicante) OR NOT(Range(InStr(heb_filiat...` |
| 14 | `Trim({0,15})` | `Trim(v.nb chambres affectées)` |
| 15 | `Trim({0,15})<>''` | `Trim(v.nb chambres affectées)<>''` |
| 16 | `Trim(Str({0,16},'2'))&' '&MlsTrans('chambres affectées po...` | `Trim(Str({0,16},'2'))&' '&MlsTrans('chambres affectées po...` |
| 17 | `{0,3}<>{0,16}` | `p.PYR Finalisé<>{0,16}` |
| 18 | `'TRUE'LOG` | `'TRUE'LOG` |
| 19 | `NOT({0,4})` | `NOT(gmr_nom__30_)` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{1,11}` | `{1,11}` |
| 4 | `{0,4}` | `gmr_nom__30_` |
| 5 | `{0,5}` | `gmr_prenom__8_` |
| 6 | `{0,4}<>0` | `gmr_nom__30_<>0` |
| 1 | `{2,1}` | `{2,1}` |
| 2 | `{0,1}` | `p.Compte` |
| 3 | `{0,2}` | `p.Nb Chambres` |
| 4 | `'H'` | `'H'` |
| 5 | `{2,9}` | `{2,9}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 3 ( W / 2 R) |
| Parametres | 4 |
| Variables locales | 16 |
| Expressions | 45 |
| Expressions 100% decodees | 31 (69%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-26 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

