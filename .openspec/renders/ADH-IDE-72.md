# ADH IDE 72 - Print extrait compte /Cum

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_72.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 72 |
| **Fichier XML** | Prg_72.xml |
| **Description** | Print extrait compte /Cum |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 14 |
| **Module** | ADH |
| **Dossier IDE** | Extrait de Compte |

> **Note**: Ce programme est Prg_72.xml. L'ID XML (72) peut differer de la position IDE (72).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-72.yaml`
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
| #867 | `log_maj_tpe` | log_maj_tpe | **W** | 5x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 8x |
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 9x |
| #34 | `cafil012_dat` | hebergement______heb | R | 1x |
| #40 | `cafil018_dat` | comptable________cte | R | 14x |
| #928 | `type_lit` | type_lit | R | 2x |

---

## 3. PARAMETRES D'ENTREE (14)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0 societe | ALPHA | - |
| P2 | P0 n° compte | NUMERIC | - |
| P3 | P0 filiation | NUMERIC | - |
| P4 | P0 masque montant | ALPHA | - |
| P5 | P0 nom village | ALPHA | - |
| P6 | P0 fictif | LOGICAL | - |
| P7 | P0 date comptable | DATE | - |
| P8 | W0 titre | ALPHA | - |
| P9 | W0 nom adherent | ALPHA | - |
| P10 | W0 prenom adherent | ALPHA | - |
| P11 | W0 n° adherent | NUMERIC | - |
| P12 | W0 lettre contrôle | ALPHA | - |
| P13 | W0 filiation | NUMERIC | - |
| P14 | W0 balance | NUMERIC | - |
| P15 | W0 date cumul | DATE | - |
| P16 | W0 masque extrait | ALPHA | - |
| P17 | W0 langue parlee | ALPHA | - |
| P18 | W0 chambre | ALPHA | - |
| P19 | W0 devise locale | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0 titre | ALPHA | - |
| W0 nom adherent | ALPHA | - |
| W0 prenom adherent | ALPHA | - |
| W0 n° adherent | NUMERIC | - |
| W0 lettre contrôle | ALPHA | - |
| W0 filiation | NUMERIC | - |
| W0 balance | NUMERIC | - |
| W0 date cumul | DATE | - |
| W0 masque extrait | ALPHA | - |
| W0 langue parlee | ALPHA | - |
| W0 chambre | ALPHA | - |
| W0 devise locale | ALPHA | - |

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

> Total: 170 variables mappees

---

## 5. EXPRESSIONS (387 total, 248 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `GetParam ('LISTINGNUMPRINTERCHOICE')` | `GetParam ('LISTINGNUMPRINTERCHOICE')` |
| 2 | `IsComponent ()` | `IsComponent ()` |
| 3 | `{0,21}<>'00/00/0000'DATE` | `W0 date cumul<>'00/00/0000'DATE` |
| 4 | `SetCrsr (1)` | `SetCrsr (1)` |
| 5 | `SetCrsr (2)` | `SetCrsr (2)` |
| 6 | `Left ({0,4},Len (RTrim ({0,4}))-1)` | `Left (P0 nom village,Len (RTrim (P0 nom village))-1)` |
| 7 | `GetParam ('CURRENTPRINTERNUM')=1` | `GetParam ('CURRENTPRINTERNUM')=1` |
| 8 | `GetParam ('CURRENTPRINTERNUM')=4` | `GetParam ('CURRENTPRINTERNUM')=4` |
| 9 | `GetParam ('CURRENTPRINTERNUM')=6` | `GetParam ('CURRENTPRINTERNUM')=6` |
| 10 | `GetParam ('CURRENTPRINTERNUM')=8` | `GetParam ('CURRENTPRINTERNUM')=8` |
| 11 | `GetParam ('CURRENTPRINTERNUM')=9` | `GetParam ('CURRENTPRINTERNUM')=9` |
| 12 | `DbDel ('{867,4}'DSOURCE,'')` | `DbDel ('{867,4}'DSOURCE,'')` |
| 13 | `'TRUE'LOG` | `'TRUE'LOG` |
| 1 | `Trim ({0,3})` | `Trim (P0 masque montant)` |
| 2 | `80` | `80` |
| 3 | `Date ()` | `Date ()` |
| 4 | `{32768,2}` | `VG.Retour Chariot` |
| 5 | `{0,1}` | `P0 n° compte` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `{1,3}` | `{1,3}` |
| 4 | `Date ()` | `Date ()` |
| 5 | `'H'` | `'H'` |
| 6 | `ASCIIChr (33)` | `ASCIIChr (33)` |
| 7 | `{0,8}` | `P.FormatPdf` |
| 8 | `{0,16}` | `W0 prenom adherent` |
| 9 | `IF ({0,10}='H','Mr',IF ({0,10}='F','Me',''))` | `IF (P.NomFichierPdf='H','Mr',IF (P.NomFichierPdf='F','Me'...` |
| 10 | `{0,5}` | `P0 fictif` |
| 11 | `{0,6}` | `P0 date comptable` |
| 12 | `{0,7}` | `P0 edtion tva 2` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 6 ( W / 5 R) |
| Parametres | 14 |
| Variables locales | 26 |
| Expressions | 387 |
| Expressions 100% decodees | 248 (64%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

