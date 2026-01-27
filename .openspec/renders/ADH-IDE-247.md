# ADH IDE 247 - Deversement Transaction

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-26
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_243.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 247 |
| **Fichier XML** | Prg_243.xml |
| **Description** | Deversement Transaction |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 15 |
| **Module** | ADH |
| **Dossier IDE** | Ventes |

> **Note**: Ce programme est Prg_243.xml. L'ID XML (243) peut differer de la position IDE (247).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-247.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (30 tables - 18 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #34 | `cafil012_dat` | hebergement______heb | **W** | 3x |
| #38 | `cafil016_dat` | comptable_gratuite | **W** | 3x |
| #40 | `cafil018_dat` | comptable________cte | **W** | 3x |
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 2x |
| #68 | `cafil046_dat` | compteurs________cpt | **W** | 1x |
| #263 | `caisse_vente` | vente | **W** | 5x |
| #264 | `caisse_vente_gratuite` | vente_gratuite | **W** | 4x |
| #268 | `ccpartyp` | cc_total_par_type | **W** | 1x |
| #271 | `cctotal` | cc_total | **W** | 1x |
| #473 | `%club_user%_caisse_compcais` | comptage_caisse | **W** | 1x |
| #596 | `%club_user%tmp_ecrpolice_dat` | tempo_ecran_police | **W** | 2x |
| #804 | `valeur_credit_bar_defaut` | valeur_credit_bar_defaut | **W** | 1x |
| #847 | `%club_user%_stat_lieu_vente_date` | stat_lieu_vente_date | **W** | 7x |
| #899 | `Boo_ResultsRechercheHoraire` | Boo_ResultsRechercheHoraire | **W** | 2x |
| #945 | `Table_945` | Unknown | **W** | 2x |
| #980 | `Table_980` | Unknown | **W** | 1x |
| #1033 | `Table_1033` | Unknown | **W** | 2x |
| #1069 | `Table_1069` | Unknown | **W** | 1x |
| #26 | `cafil004_dat` | comptes_speciaux_spc | R | 1x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | R | 1x |
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 1x |
| #65 | `cafil043_dat` | comptes_recette__cre | R | 7x |
| #67 | `cafil045_dat` | tables___________tab | R | 2x |
| #77 | `cafil055_dat` | articles_________art | R | 4x |
| #89 | `cafil067_dat` | moyen_paiement___mop | R | 3x |
| #113 | `cafil091_dat` | tables_village | R | 1x |
| #382 | `pv_discountlist_dat` | pv_discount_reasons | R | 1x |
| #839 | `##%club_user%_%term%_pv_account` | ##_pv_compta_dat | R | 1x |
| #933 | `taxe_add_vente` | taxe_add_vente | R | 1x |
| #1037 | `Table_1037` | Unknown | R | 1x |

---

## 3. PARAMETRES D'ENTREE (15)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | p.Gratuite *NON Utilisé* | ALPHA | - |
| P2 | p.Annulation | ALPHA | - |
| P3 | p.Date Comptable | DATE | - |
| P4 | p.Solde Du Compte | NUMERIC | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.Lien Article | LOGICAL | - |
| v.Type article | UNICODE | - |
| v.adresse-mail-0-soucis | UNICODE | - |
| V.Est un compte special ? | LOGICAL | - |
| V.montant remise | NUMERIC | - |
| V.Nb reglement | NUMERIC | - |
| V.id ligne annulation | NUMERIC | - |
| v.retour lien LCO | LOGICAL | - |
| v0.NoTicket OD | NUMERIC | - |
| v0.NoTicket autre reg | NUMERIC | - |
| v.0.ID_Ligne_OD_40 | NUMERIC | - |
| v.0.ID_Ligne_Vente_263 | NUMERIC | - |
| v0.Date Encaissement | DATE | - |
| v0.Heure Encaissement | TIME | - |
| v.ligne de vente ass 0 soucis? | LOGICAL | - |
| v. envoyer à galaxy | LOGICAL | - |
| v. no_order_galaxy | UNICODE | - |

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

> Total: 184 variables mappees

---

## 5. EXPRESSIONS (546 total, 161 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,27}='OD' AND NOT {0,49} AND (NOT {0,59} OR Trim({0,55}...` | `v.0.ID_Ligne_Vente_263='OD' AND NOT {0,49} AND (NOT {0,59...` |
| 2 | `(NOT ({0,59}) OR (Trim({0,55})='PYR' AND {0,33}=0)) AND {...` | `(NOT ({0,59}) OR (Trim({0,55})='PYR' AND {0,33}=0)) AND v...` |
| 3 | `{0,59}` | `{0,59}` |
| 4 | `{0,27}='OD' AND NOT {0,49} AND {0,59}` | `v.0.ID_Ligne_Vente_263='OD' AND NOT {0,49} AND {0,59}` |
| 5 | `{0,18}` | `V.Est un compte special ?` |
| 6 | `'99'` | `'99'` |
| 7 | `{0,98}='VSL'` | `{0,98}='VSL'` |
| 8 | `{0,14}` | `P.i.Transaction Id` |
| 9 | `{0,15}` | `v.Lien Article` |
| 10 | `{0,16}` | `v.Type article` |
| 11 | `{0,29}` | `v0.Heure Encaissement` |
| 12 | `'A'` | `'A'` |
| 13 | `{32768,7} AND IN ( {0,98} ,'VRL','VSL')` | `VG.VRL ACTIF ? AND IN ( {0,98} ,'VRL','VSL')` |
| 14 | `{0,23}<>0 OR {0,52}<>0 OR {0,55}='PYR'` | `v.retour lien LCO<>0 OR {0,52}<>0 OR {0,55}='PYR'` |
| 15 | `{0,15}` | `v.Lien Article` |
| 16 | `{0,27}` | `v.0.ID_Ligne_Vente_263` |
| 17 | `'TRUE'LOG` | `'TRUE'LOG` |
| 18 | `Trim({0,27})='OD' AND {0,2}='O' AND NOT {0,59}` | `Trim(v.0.ID_Ligne_Vente_263)='OD' AND p.Date Comptable='O...` |
| 19 | `IF(Trim({0,27})='OD','OD','')` | `IF(Trim(v.0.ID_Ligne_Vente_263)='OD','OD','')` |
| 20 | `{0,125}` | `{0,125}` |
| 21 | `{0,127}` | `{0,127}` |
| 22 | `Trim({0,27})<>'OD' AND {0,2}='O' AND NOT {0,59}` | `Trim(v.0.ID_Ligne_Vente_263)<>'OD' AND p.Date Comptable='...` |
| 23 | `NOT ({0,59}) OR {0,27}='OD' AND NOT {0,49} AND NOT ({0,59})` | `NOT ({0,59}) OR v.0.ID_Ligne_Vente_263='OD' AND NOT {0,49...` |
| 24 | `{0,48}` | `{0,48}` |
| 25 | `IF({0,2}='O',{0,137}+(ABS({0,52})),{0,137}-(ABS({0,52})))` | `IF(p.Date Comptable='O',{0,137}+(ABS({0,52})),{0,137}-(AB...` |
| 26 | `IF({0,2}='O',{0,141}+(ABS({0,52})),{0,141}-(ABS({0,52})))` | `IF(p.Date Comptable='O',{0,141}+(ABS({0,52})),{0,141}-(AB...` |
| 27 | `Date()` | `Date()` |
| 28 | `Time()` | `Time()` |
| 29 | `{0,51} AND NOT({0,59}) AND {0,60}='GP'` | `{0,51} AND NOT({0,59}) AND {0,60}='GP'` |
| 30 | `Trim({0,27})='OD' AND {0,2}='O' AND {0,59}` | `Trim(v.0.ID_Ligne_Vente_263)='OD' AND p.Date Comptable='O...` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 30 (18 W / 12 R) |
| Parametres | 15 |
| Variables locales | 33 |
| Expressions | 546 |
| Expressions 100% decodees | 161 (29%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-26 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

