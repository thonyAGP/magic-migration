# ADH IDE 193 - Solde compte fin sejour

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_192.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 193 |
| **Fichier XML** | Prg_192.xml |
| **Description** | Solde compte fin sejour |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 27 |
| **Module** | ADH |
| **Dossier IDE** | Solde |

> **Note**: Ce programme est Prg_192.xml. L'ID XML (192) peut differer de la position IDE (193).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-193.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (35 tables - 19 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #23 | `cafil001_dat` | reseau_cloture___rec | **W** | 5x |
| #34 | `cafil012_dat` | hebergement______heb | **W** | 1x |
| #39 | `cafil017_dat` | depot_garantie___dga | **W** | 4x |
| #40 | `cafil018_dat` | comptable________cte | **W** | 19x |
| #44 | `cafil022_dat` | change___________chg | **W** | 4x |
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 7x |
| #48 | `cafil026_dat` | lignes_de_solde__sld | **W** | 3x |
| #53 | `cafil031_dat` | ligne_telephone__lgn | **W** | 1x |
| #68 | `cafil046_dat` | compteurs________cpt | **W** | 12x |
| #75 | `cafil053_dat` | commande_autocom_cot | **W** | 1x |
| #80 | `cafil058_dat` | codes_autocom____aut | **W** | 4x |
| #87 | `cafil065_dat` | sda_telephone____sda | **W** | 4x |
| #136 | `cafil114_dat` | fichier_echanges | **W** | 2x |
| #148 | `cafil126_dat` | lignes_de_solde__sld | **W** | 2x |
| #151 | `cafil129_dat` | nb_code__poste | **W** | 2x |
| #268 | `ccpartyp` | cc_total_par_type | **W** | 2x |
| #474 | `%club_user%_caisse_compcais_devise` | comptage_caisse_devise | **W** | 3x |
| #945 | `Table_945` | Unknown | **W** | 4x |
| #979 | `Table_979` | Unknown | **W** | 3x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 2x |
| #50 | `cafil028_dat` | moyens_reglement_mor | R | 1x |
| #66 | `cafil044_dat` | imputations______imp | R | 2x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 4x |
| #77 | `cafil055_dat` | articles_________art | R | 1x |
| #89 | `cafil067_dat` | moyen_paiement___mop | R | 3x |
| #124 | `cafil102_dat` | type_taux_change | R | 1x |
| #139 | `cafil117_dat` | moyens_reglement_mor | R | 1x |
| #141 | `cafil119_dat` | devises__________dev | R | 1x |
| #312 | `ezcard` | ez_card | R | 1x |
| #382 | `pv_discountlist_dat` | pv_discount_reasons | R | 2x |
| #400 | `pv_rentals_dat` | pv_cust_rentals | R | 1x |
| #403 | `pv_sellers_dat` | pv_sellers | R | 1x |
| #404 | `pv_sellersweek_dat` | pv_sellers_by_week | R | 1x |
| #728 | `arc_cctotal` | arc_cc_total | R | 1x |

---

## 3. PARAMETRES D'ENTREE (27)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | > societe | ALPHA | - |
| P2 | > code adherent | NUMERIC | - |
| P3 | > filiation | NUMERIC | - |
| P4 | > devise locale | ALPHA | - |
| P5 | > nb decimale | NUMERIC | - |
| P6 | > masque mtt | ALPHA | - |
| P7 | > presence CAM | ALPHA | - |
| P8 | > solde compte | NUMERIC | - |
| P9 | > etat compte | ALPHA | - |
| P10 | > date du solde | DATE | - |
| P11 | > garantie / compte | ALPHA | - |
| P12 | > code retour | ALPHA | - |
| P13 | > nom village | ALPHA | - |
| P14 | > village à tel ? | ALPHA | - |
| P15 | > tel à cam ? | ALPHA | - |
| P16 | > village à bibop ? | ALPHA | - |
| P17 | > type de triplet | ALPHA | - |
| P18 | > type interface | ALPHA | - |
| P19 | > telephone | ALPHA | - |
| P20 | > fax | ALPHA | - |
| P21 | > choix action | ALPHA | - |
| P22 | v.control-action | ALPHA | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.control-action | ALPHA | - |
| v.CAM valide ? | ALPHA | - |
| v.nb Club Med Pass a recuperer | NUMERIC | - |
| v.code autocom val? | ALPHA | - |
| v.bibop valide ? | ALPHA | - |
| v.solde garantie | ALPHA | - |
| v.message basecran | ALPHA | - |
| v.solde compte | NUMERIC | - |
| v.date solde | DATE | - |
| v.heure solde | TIME | - |
| v.date comptable | DATE | - |
| v.date annulation | DATE | - |
| v.heure annulation | TIME | - |
| v.etat reseau flag | ALPHA | - |
| v.Confirmation Edition Facture | NUMERIC | - |
| v.Existe depot objet | LOGICAL | - |
| v.Existe depot devise | LOGICAL | - |
| v.Existe depot scelle | LOGICAL | - |
| v.Montant Carte | NUMERIC | - |
| v.Id dossier PMS | ALPHA | - |

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

> Total: 254 variables mappees

---

## 5. EXPRESSIONS (992 total, 558 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `SetCrsr (1)` | `SetCrsr (1)` |
| 2 | `DbDel ('{979,4}'DSOURCE,'')` | `DbDel ('{979,4}'DSOURCE,'')` |
| 3 | `{0,49} > 0 AND {32768,60} AND NOT({0,23})` | `v.Solde Free Extra > 0 AND VG.Gift Pass 3.00 AND NOT(P.Da...` |
| 4 | `'FALSE'LOG` | `'FALSE'LOG` |
| 5 | `SetCrsr (2)` | `SetCrsr (2)` |
| 6 | `{0,26}<>'F'` | `v.CAM valide ?<>'F'` |
| 7 | `{0,26}='S'` | `v.CAM valide ?='S'` |
| 8 | `{0,26}='S' AND {0,7}='O'` | `v.CAM valide ?='S' AND > solde compte='O'` |
| 9 | `{0,26}='S' AND {0,14}='O' AND {0,15}='N'` | `v.CAM valide ?='S' AND > tel à cam ?='O' AND > village à ...` |
| 10 | `{0,26}='S' AND {0,14}='O' AND {0,15}='O'` | `v.CAM valide ?='S' AND > tel à cam ?='O' AND > village à ...` |
| 11 | `{0,26}='T'` | `v.CAM valide ?='T'` |
| 12 | `{0,26}='U'` | `v.CAM valide ?='U'` |
| 13 | `{0,26}='U' AND {0,27}='O'` | `v.CAM valide ?='U' AND v.nb Club Med Pass a recuperer='O'` |
| 14 | `{0,26}='U' AND {0,29}='O' AND {0,18}<>'CLUB'` | `v.CAM valide ?='U' AND v.bibop valide ?='O' AND > telepho...` |
| 15 | `{0,26}='U' AND {0,29}='O' AND {0,18}='CLUB'` | `v.CAM valide ?='U' AND v.bibop valide ?='O' AND > telepho...` |
| 16 | `{0,26}='U' AND {0,31}='O'` | `v.CAM valide ?='U' AND v.message basecran='O'` |
| 17 | `{0,26}='A'` | `v.CAM valide ?='A'` |
| 18 | `{0,7}='O'` | `> solde compte='O'` |
| 19 | `{0,14}='O'` | `> tel à cam ?='O'` |
| 20 | `{0,7}='O' AND {0,14}='O'` | `> solde compte='O' AND > tel à cam ?='O'` |
| 21 | `{0,26}='F'` | `v.CAM valide ?='F'` |
| 22 | `'F'` | `'F'` |
| 23 | `{0,12}='P'` | `> nom village='P'` |
| 24 | `'R'` | `'R'` |
| 25 | `'S'` | `'S'` |
| 26 | `'Q'` | `'Q'` |
| 27 | `MlsTrans ('Nombre de carte(s) à recuperer')&' : '&Trim (S...` | `MlsTrans ('Nombre de carte(s) à recuperer')&' : '&Trim (S...` |
| 28 | `{0,41} OR {0,42} OR {0,43}` | `v.Existe depot devise OR v.Existe depot scelle OR v.Monta...` |
| 29 | `'FIN'` | `'FIN'` |
| 30 | `24` | `24` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 35 (19 W / 16 R) |
| Parametres | 27 |
| Variables locales | 68 |
| Expressions | 992 |
| Expressions 100% decodees | 558 (56%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

