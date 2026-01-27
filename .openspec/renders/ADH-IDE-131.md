# ADH IDE 131 - Fermeture caisse

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_131.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 131 |
| **Fichier XML** | Prg_131.xml |
| **Description** | Fermeture caisse |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 17 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_131.xml. L'ID XML (131) peut differer de la position IDE (131).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-131.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (10 tables - 4 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #241 | `caisse_pointage_apprem` | pointage_appro_remise | **W** | 2x |
| #242 | `caisse_pointage_article` | pointage_article | **W** | 2x |
| #243 | `caisse_pointage_devise` | pointage_devise | **W** | 2x |
| #250 | `caisse_session_devise` | histo_sessions_caisse_devise | **W** | 2x |
| #50 | `cafil028_dat` | moyens_reglement_mor | R | 2x |
| #67 | `cafil045_dat` | tables___________tab | R | 1x |
| #139 | `cafil117_dat` | moyens_reglement_mor | R | 2x |
| #232 | `caisse_devise` | gestion_devise_session | R | 2x |
| #249 | `caisse_session_detail` | histo_sessions_caisse_detail | R | 2x |
| #693 | `devisein_par` | devise_in | R | 1x |

---

## 3. PARAMETRES D'ENTREE (17)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Param societe | ALPHA | - |
| P2 | Param devise locale | ALPHA | - |
| P3 | Param Nbre decimales | NUMERIC | - |
| P4 | Param masque montant | ALPHA | - |
| P5 | Param code village | ALPHA | - |
| P6 | Param nom village | ALPHA | - |
| P7 | Param masque cumul | ALPHA | - |
| P8 | Param Uni/Bi | ALPHA | - |
| P9 | Param village TAI | ALPHA | - |
| P10 | Param Date comptable | DATE | - |
| P11 | Param fermeture validee | LOGICAL | - |
| P12 | Param chrono session | NUMERIC | - |
| P13 | p.i.Terminal coffre2 | NUMERIC | - |
| P14 | Param coffre 2 est ouvert | LOGICAL | - |
| P15 | Fin | LOGICAL | - |
| P16 | Action | NUMERIC | - |
| P17 | Flag avancement | NUMERIC | - |
| P18 | Montant initial | NUMERIC | - |
| P19 | Montant initial monnaie | NUMERIC | - |
| P20 | Montant initial produits | NUMERIC | - |
| P21 | Montant initial cartes | NUMERIC | - |
| P22 | Montant initial cheques | NUMERIC | - |

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

> Total: 237 variables mappees

---

## 5. EXPRESSIONS (274 total, 133 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,19}=0` | `Nbre devise apport=0` |
| 2 | `{0,18}` | `Montant apport produits` |
| 3 | `{0,79}` | `Edition ticket remise / appro` |
| 4 | `{0,80}` | `Edition ticket recap` |
| 5 | `{0,81}` | `Editer ticket recap dans ecart` |
| 6 | `{0,82}` | `{0,82}` |
| 7 | `'FALSE'LOG` | `'FALSE'LOG` |
| 8 | `'F'` | `'F'` |
| 9 | `{0,58}<>0 OR {0,59}<>0 OR {0,52}<>0 OR {0,54}<>0 OR {0,55...` | `Montant apport produits<>0 OR Nbre devise apport<>0 OR Mo...` |
| 10 | `'D'` | `'D'` |
| 11 | `'TRUE'LOG` | `'TRUE'LOG` |
| 12 | `NOT {0,17}` | `NOT Montant apport coffre` |
| 1 | `Date ()` | `Date ()` |
| 2 | `{32768,2}` | `VG.Retour Chariot` |
| 3 | `Trim ({0,12})` | `Trim (Montant versement produits)` |
| 4 | `'0'` | `'0'` |
| 5 | `'1'` | `'1'` |
| 6 | `'2'` | `'2'` |
| 7 | `'3'` | `'3'` |
| 8 | `'4'` | `'4'` |
| 9 | `'5'` | `'5'` |
| 10 | `'6'` | `'6'` |
| 11 | `'7'` | `'7'` |
| 12 | `'8'` | `'8'` |
| 13 | `'9'` | `'9'` |
| 14 | `{1,4}` | `{1,4}` |
| 15 | `144` | `144` |
| 16 | `{1,20}>0` | `{1,20}>0` |
| 17 | `{1,20}>2` | `{1,20}>2` |
| 18 | `{1,20}>3` | `{1,20}>3` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 10 (4 W / 6 R) |
| Parametres | 17 |
| Variables locales | 82 |
| Expressions | 274 |
| Expressions 100% decodees | 133 (49%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

