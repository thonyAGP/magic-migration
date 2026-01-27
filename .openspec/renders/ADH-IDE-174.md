# ADH IDE 174 - Versement/Retrait

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_173.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 174 |
| **Fichier XML** | Prg_173.xml |
| **Description** | Versement/Retrait |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 15 |
| **Module** | ADH |
| **Dossier IDE** | Operations GM |

> **Note**: Ce programme est Prg_173.xml. L'ID XML (173) peut differer de la position IDE (174).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-174.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (23 tables - 11 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #23 | `cafil001_dat` | reseau_cloture___rec | **W** | 9x |
| #39 | `cafil017_dat` | depot_garantie___dga | **W** | 2x |
| #40 | `cafil018_dat` | comptable________cte | **W** | 7x |
| #44 | `cafil022_dat` | change___________chg | **W** | 4x |
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 9x |
| #68 | `cafil046_dat` | compteurs________cpt | **W** | 6x |
| #88 | `cafil066_dat` | historik_station | **W** | 1x |
| #147 | `cafil125_dat` | change_vente_____chg | **W** | 2x |
| #173 | `cafil181_dat` | intermed_compta__ite | **W** | 1x |
| #474 | `%club_user%_caisse_compcais_devise` | comptage_caisse_devise | **W** | 3x |
| #945 | `Table_945` | Unknown | **W** | 2x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 1x |
| #50 | `cafil028_dat` | moyens_reglement_mor | R | 1x |
| #66 | `cafil044_dat` | imputations______imp | R | 3x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 1x |
| #89 | `cafil067_dat` | moyen_paiement___mop | R | 1x |
| #124 | `cafil102_dat` | type_taux_change | R | 1x |
| #139 | `cafil117_dat` | moyens_reglement_mor | R | 1x |
| #372 | `pv_budget_dat` | pv_budget | R | 1x |
| #728 | `arc_cctotal` | arc_cc_total | R | 1x |
| #786 | `qualite_avant_reprise` | qualite_avant_reprise | R | 1x |
| #934 | `selection_enregistrement_div` | selection enregistrement diver | R | 1x |

---

## 3. PARAMETRES D'ENTREE (15)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | > societe | ALPHA | - |
| P2 | > code GM | NUMERIC | - |
| P3 | > filiation | NUMERIC | - |
| P4 | > devise locale | ALPHA | - |
| P5 | > nb decimale | NUMERIC | - |
| P6 | > masque mtt | ALPHA | - |
| P7 | > solde compte | NUMERIC | - |
| P8 | > code retour | ALPHA | - |
| P9 | > nom village | ALPHA | - |
| P10 | > etat compte | ALPHA | - |
| P11 | > date solde | DATE | - |
| P12 | > garanti O/N | ALPHA | - |
| P13 | > telephone | ALPHA | - |
| P14 | > fax | ALPHA | - |
| P15 | V0 choix action | ALPHA | - |
| P16 | W0 vers. ou retrait | ALPHA | - |
| P17 | W0 scroll vide | ALPHA | - |
| P18 | W0 date comptable | DATE | - |
| P19 | W0 date operation | DATE | - |
| P20 | W0 heure operation | TIME | - |
| P21 | W0 message | ALPHA | - |
| P22 | W0 reseau | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| V0 choix action | ALPHA | - |
| W0 vers. ou retrait | ALPHA | - |
| W0 scroll vide | ALPHA | - |
| W0 date comptable | DATE | - |
| W0 date operation | DATE | - |
| W0 heure operation | TIME | - |
| W0 message | ALPHA | - |
| W0 reseau | ALPHA | - |
| W0 cloture en cours | NUMERIC | - |
| W0 qualite | ALPHA | - |
| W0 Session caisse ouverte? | LOGICAL | - |
| v.titre | ALPHA | - |
| V.N°Ticket (VER/RET) | NUMERIC | - |
| v.Email VAD | ALPHA | - |

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

> Total: 176 variables mappees

---

## 5. EXPRESSIONS (538 total, 245 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `SetCrsr (1)` | `SetCrsr (1)` |
| 2 | `{0,1}=''` | `> code GM=''` |
| 3 | `'C'` | `'C'` |
| 4 | `Trim ({0,32})` | `Trim ({0,32})` |
| 5 | `{0,1}` | `> code GM` |
| 6 | `'C'` | `'C'` |
| 7 | `{0,24}=0` | `W0 qualite=0` |
| 8 | `{0,24}<>0 OR Trim (GetParam ('OPERATION_CLOTURE'))='O'` | `W0 qualite<>0 OR Trim (GetParam ('OPERATION_CLOTURE'))='O'` |
| 9 | `'F'` | `'F'` |
| 10 | `{0,16}<>'F'` | `W0 vers. ou retrait<>'F'` |
| 11 | `{0,18}='O'` | `W0 date comptable='O'` |
| 12 | `{0,16}='F'` | `W0 vers. ou retrait='F'` |
| 13 | `{0,27}` | `V.N°Ticket (VER/RET)` |
| 14 | `{0,22}<>''` | `W0 reseau<>''` |
| 15 | `{0,23}<>'R'` | `W0 cloture en cours<>'R'` |
| 16 | `'##########.##Z'` | `'##########.##Z'` |
| 17 | `{0,6}=''` | `> solde compte=''` |
| 18 | `Trim (GetParam ('OPERATION_CLOTURE'))<>'O' OR Trim (GetPa...` | `Trim (GetParam ('OPERATION_CLOTURE'))<>'O' OR Trim (GetPa...` |
| 19 | `NOT {32768,78}` | `NOT VG.Hostname au lieu de Term` |
| 20 | `{32768,78}` | `VG.Hostname au lieu de Term` |
| 1 | `SetCrsr (1)` | `SetCrsr (1)` |
| 2 | `MlsTrans('Versement/Retrait')` | `MlsTrans('Versement/Retrait')` |
| 3 | `{32768,2}` | `VG.Retour Chariot` |
| 4 | `Date ()` | `Date ()` |
| 5 | `{1,1}` | `{1,1}` |
| 6 | `{1,2}` | `{1,2}` |
| 7 | `{0,13}` | `> fax` |
| 8 | `{1,6}` | `{1,6}` |
| 9 | `{1,20}` | `{1,20}` |
| 10 | `{1,21}` | `{1,21}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 23 (11 W / 12 R) |
| Parametres | 15 |
| Variables locales | 29 |
| Expressions | 538 |
| Expressions 100% decodees | 245 (46%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

