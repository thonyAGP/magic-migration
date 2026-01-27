# ADH IDE 76 - Print extrait compte /Service

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_76.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 76 |
| **Fichier XML** | Prg_76.xml |
| **Description** | Print extrait compte /Service |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 15 |
| **Module** | ADH |
| **Dossier IDE** | EzCard |

> **Note**: Ce programme est Prg_76.xml. L'ID XML (76) peut differer de la position IDE (76).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-76.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (9 tables -  en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #867 | `log_maj_tpe` | log_maj_tpe | **W** | 4x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 5x |
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 3x |
| #34 | `cafil012_dat` | hebergement______heb | R | 1x |
| #40 | `cafil018_dat` | comptable________cte | R | 8x |
| #67 | `cafil045_dat` | tables___________tab | R | 3x |
| #400 | `pv_rentals_dat` | pv_cust_rentals | R | 1x |
| #413 | `pv_tva_dat` | pv_tva | R | 1x |
| #928 | `type_lit` | type_lit | R | 2x |

---

## 3. PARAMETRES D'ENTREE (15)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0 societe | ALPHA | - |
| P2 | P0 code adherent | NUMERIC | - |
| P3 | P0 filiation | NUMERIC | - |
| P4 | P0 masque montant | ALPHA | - |
| P5 | P0 nom village | ALPHA | - |
| P6 | P0 fictif | LOGICAL | - |
| P7 | P0 date comptable | DATE | - |
| P8 | W0 nom | ALPHA | - |
| P9 | W0 prenom | ALPHA | - |
| P10 | W0 titre | ALPHA | - |
| P11 | W0 n° adherent | NUMERIC | - |
| P12 | W0 lettre contrôle | ALPHA | - |
| P13 | W0 filiation | NUMERIC | - |
| P14 | W0 langue parlee | ALPHA | - |
| P15 | W0 chambre | ALPHA | - |
| P16 | W0 masque extrait | ALPHA | - |
| P17 | W0 devise local | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| W0 nom | ALPHA | - |
| W0 prenom | ALPHA | - |
| W0 titre | ALPHA | - |
| W0 n° adherent | NUMERIC | - |
| W0 lettre contrôle | ALPHA | - |
| W0 filiation | NUMERIC | - |
| W0 langue parlee | ALPHA | - |
| W0 chambre | ALPHA | - |
| W0 Date Début Séjour | DATE | - |
| W0 Date Fin Séjour | DATE | - |
| W0 code inscription | UNICODE | - |
| v. Libelle edition | ALPHA | - |
| v. Libelle Categ | ALPHA | - |
| W0 masque extrait | ALPHA | - |
| W0 devise local | ALPHA | - |

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

> Total: 178 variables mappees

---

## 5. EXPRESSIONS (304 total, 206 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `GetParam ('LISTINGNUMPRINTERCHOICE')` | `GetParam ('LISTINGNUMPRINTERCHOICE')` |
| 2 | `IsComponent () AND NOT({0,14})` | `IsComponent () AND NOT(P. Sans annulations)` |
| 3 | `SetCrsr (1)` | `SetCrsr (1)` |
| 4 | `SetCrsr (2)` | `SetCrsr (2)` |
| 5 | `Left ({0,4},Len (RTrim ({0,4}))-1)` | `Left (P0 nom village,Len (RTrim (P0 nom village))-1)` |
| 6 | `GetParam ('CURRENTPRINTERNUM')=1` | `GetParam ('CURRENTPRINTERNUM')=1` |
| 7 | `GetParam ('CURRENTPRINTERNUM')=8` | `GetParam ('CURRENTPRINTERNUM')=8` |
| 8 | `GetParam ('CURRENTPRINTERNUM')=9` | `GetParam ('CURRENTPRINTERNUM')=9` |
| 9 | `DbDel ('{867,4}'DSOURCE,'')` | `DbDel ('{867,4}'DSOURCE,'')` |
| 10 | `NOT({0,9})` | `NOT(P.Chemin)` |
| 11 | `'Extrait de compte / Account statement'` | `'Extrait de compte / Account statement'` |
| 12 | `'Par Service / By Service'` | `'Par Service / By Service'` |
| 13 | `'TRUE'LOG` | `'TRUE'LOG` |
| 1 | `Counter (0)>=GetParam ('NUMBERCOPIES')` | `Counter (0)>=GetParam ('NUMBERCOPIES')` |
| 2 | `SetParam ('CURRENTPAGENUMBER',0)` | `SetParam ('CURRENTPAGENUMBER',0)` |
| 3 | `DbDel ('{867,4}'DSOURCE,'')` | `DbDel ('{867,4}'DSOURCE,'')` |
| 4 | `NOT({1,9})` | `NOT({1,9})` |
| 1 | `{32768,44}` | `VG.VG_FAX_VISIBLE` |
| 2 | `{2,1}` | `{2,1}` |
| 3 | `{2,2}` | `{2,2}` |
| 4 | `CndRange({2,6},{2,7})` | `CndRange({2,6},{2,7})` |
| 5 | `{2,28}` | `{2,28}` |
| 6 | `{0,1}+{0,15}` | `P0 code adherent+W0 nom` |
| 7 | `{0,1}` | `P0 code adherent` |
| 8 | `{0,3}+{0,15}` | `P0 masque montant+W0 nom` |
| 9 | `0` | `0` |
| 10 | `{0,5}` | `P0 fictif` |
| 11 | `{0,7}` | `P0 Edtion Tva V2` |
| 12 | `IF ({0,2}>0,MlsTrans ('Solde crediteur'),IF ({0,2}<0,MlsT...` | `IF (P0 filiation>0,MlsTrans ('Solde crediteur'),IF (P0 fi...` |
| 13 | `Date ()` | `Date ()` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 9 ( W / 8 R) |
| Parametres | 15 |
| Variables locales | 30 |
| Expressions | 304 |
| Expressions 100% decodees | 206 (68%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

