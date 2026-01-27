# ADH IDE 27 - Separation

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_27.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 27 |
| **Fichier XML** | Prg_27.xml |
| **Description** | Separation |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 13 |
| **Module** | ADH |
| **Dossier IDE** | Changement Compte |

> **Note**: Ce programme est Prg_27.xml. L'ID XML (27) peut differer de la position IDE (27).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
- **Qui**: Operateur caisse / Receptionniste
- **Quoi**: Separer un compte adherent en plusieurs comptes
- **Pourquoi**: Permettre la division d'un compte famille en comptes individuels (depart anticipe, facturation separee)
### 1.2 Flux Utilisateur
1. Selection du compte source a separer
2. Affichage des membres du compte et leurs operations
3. Selection des membres a transferer vers nouveau compte
4. Verification des depots et garanties a transferer
5. Confirmation de la separation
6. Creation du nouveau compte avec operations selectionnees
7. Mise a jour des soldes des deux comptes

### 1.3 Notes Migration
- Programme ECF partage - appele depuis PBP et PVE
- Manipulation transactionnelle de plusieurs tables
- Gestion des depots et garanties
- 1458 expressions - logique complexe
- Validation integrite compte avant/apres

### 1.4 Dependances ECF

PARTAGE via ADH.ecf (Sessions_Reprises) - Appele depuis PBP et PVE

### 1.5 Tags
`compte``, ``separation``, ``ecf-shared``, ``cross-project``, ``critical`

---

## 2. TABLES (60 tables - 58 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #15 | `bartransacent` | transac_entete_bar | **W** | 3x |
| #19 | `bldetail` | bl_detail | **W** | 3x |
| #23 | `cafil001_dat` | reseau_cloture___rec | **W** | 5x |
| #29 | `cafil007_dat` | voyages__________voy | **W** | 3x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | **W** | 10x |
| #31 | `cafil009_dat` | gm-complet_______gmc | **W** | 2x |
| #32 | `cafil010_dat` | prestations | **W** | 3x |
| #33 | `cafil011_dat` | prestations______pre | **W** | 3x |
| #34 | `cafil012_dat` | hebergement______heb | **W** | 3x |
| #35 | `cafil013_dat` | personnel_go______go | **W** | 2x |
| #36 | `cafil014_dat` | client_gm | **W** | 2x |
| #37 | `cafil015_dat` | commentaire_gm_________acc | **W** | 3x |
| #38 | `cafil016_dat` | comptable_gratuite | **W** | 3x |
| #39 | `cafil017_dat` | depot_garantie___dga | **W** | 6x |
| #40 | `cafil018_dat` | comptable________cte | **W** | 10x |
| #44 | `cafil022_dat` | change___________chg | **W** | 2x |
| #46 | `cafil024_dat` | mvt_prestation___mpr | **W** | 3x |
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 5x |
| #51 | `cafil029_dat` | fusion_eclatementfec | **W** | 1x |
| #68 | `cafil046_dat` | compteurs________cpt | **W** | 3x |
| #79 | `cafil057_dat` | gratuites________gra | **W** | 3x |
| #80 | `cafil058_dat` | codes_autocom____aut | **W** | 2x |
| #93 | `cafil071_dat` | vendeurs_________ven | **W** | 1x |
| #123 | `cafil101_dat` | fichier_messagerie | **W** | 2x |
| #131 | `cafil109_dat` | fichier_validation | **W** | 3x |
| #137 | `cafil115_dat` | fichier_histotel | **W** | 3x |
| #147 | `cafil125_dat` | change_vente_____chg | **W** | 2x |
| #167 | `cafil145_dat` | troncon__________tro | **W** | 1x |
| #168 | `cafil146_dat` | heb_circuit______hci | **W** | 3x |
| #171 | `cafil149_dat` | commentaire______com | **W** | 1x |
| #263 | `caisse_vente` | vente | **W** | 2x |
| #266 | `cccompta` | cc_comptable | **W** | 3x |
| #268 | `ccpartyp` | cc_total_par_type | **W** | 3x |
| #271 | `cctotal` | cc_total | **W** | 3x |
| #272 | `cctypdet` | cc_type_detail | **W** | 3x |
| #285 | `email` | email | **W** | 1x |
| #298 | `excupar_dat` | participants_____par | **W** | 3x |
| #301 | `excupta_dat` | details_partici__dpa | **W** | 3x |
| #307 | `excuveo_dat` | vente_option_veo | **W** | 3x |
| #309 | `excuvepe_dat` | vente____________vep | **W** | 4x |
| #312 | `ezcard` | ez_card | **W** | 2x |
| #340 | `histo_fus_sep` | histo_fusionseparation | **W** | 5x |
| #343 | `histo_fus_sep_saisie` | histo_fusionseparation_saisie | **W** | 11x |
| #358 | `moddossier_dat` | import_mod | **W** | 3x |
| #366 | `pmsprintparam` | pms_print_param | **W** | 3x |
| #377 | `pv_contracts_dat` | pv_contracts | **W** | 2x |
| #382 | `pv_discountlist_dat` | pv_discount_reasons | **W** | 2x |
| #400 | `pv_rentals_dat` | pv_cust_rentals | **W** | 2x |
| #463 | `verifpool_dat` | heure_de_passage | **W** | 3x |
| #786 | `qualite_avant_reprise` | qualite_avant_reprise | **W** | 2x |
| #804 | `valeur_credit_bar_defaut` | valeur_credit_bar_defaut | **W** | 1x |
| #805 | `vente_par_moyen_paiement` | vente_par_moyen_paiement | **W** | 3x |
| #807 | `plafond_lit` | plafond_lit | **W** | 3x |
| #831 | `import_go_erreur_affection` | import_go_erreur_affection | **W** | 3x |
| #834 | `tpe_par_terminal` | tpe_par_terminal | **W** | 3x |
| #837 | `##%club_user%_%term%_pv_customer` | ##_pv_customer_dat | **W** | 3x |
| #947 | `Table_947` | Unknown | **W** | 3x |
| #1059 | `Table_1059` | Unknown | **W** | 1x |
| #70 | `cafil048_dat` | date_comptable___dat | R | 1x |
| #342 | `histo_fus_sep_log` | histo__fusionseparation_log | R | 2x |

---

## 3. PARAMETRES D'ENTREE (13)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0 societe | ALPHA | - |
| P2 | P0 code GM | NUMERIC | - |
| P3 | P0 filiation | NUMERIC | - |
| P4 | P0 masque montant | ALPHA | - |
| P5 | P0 garantie | ALPHA | - |
| P6 | P0 solde | NUMERIC | - |
| P7 | P0 date limite solde | DATE | - |
| P8 | P0 nom village | ALPHA | - |
| P9 | P0 Uni/Bilateral | ALPHA | - |
| P10 | W0 imprimante | NUMERIC | - |
| P11 | W0 reseau | ALPHA | - |
| P12 | W0 validation | LOGICAL | - |
| P13 | W0 n° compteur | NUMERIC | - |
| P14 | W0 nbre filiation | NUMERIC | - |
| P15 | W0 date operation | DATE | - |
| P16 | W0 heure operation | TIME | - |
| P17 | W0 nom/prenom newcpt | ALPHA | - |
| P18 | W0 qualite compte | ALPHA | - |
| P19 | W0 fin tâche | ALPHA | - |
| P20 | W0 separation n compte unique | LOGICAL | - |
| P21 | W0 Existe ecriture | LOGICAL | - |
| P22 | W0 normal | LOGICAL | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Ref | Nom | Type | Role |
|-----|-----|------|------|
| `{0,-78}` | W0 imprimante | NUMERIC | - |
| `{0,-77}` | W0 reseau | ALPHA | - |
| `{0,-76}` | W0 validation | LOGICAL | - |
| `{0,-75}` | W0 n° compteur | NUMERIC | - |
| `{0,-74}` | W0 nbre filiation | NUMERIC | - |
| `{0,-73}` | W0 date operation | DATE | - |
| `{0,-72}` | W0 heure operation | TIME | - |
| `{0,-71}` | W0 nom/prenom newcpt | ALPHA | - |
| `{0,-70}` | W0 qualite compte | ALPHA | - |
| `{0,-69}` | W0 fin tâche | ALPHA | - |
| `{0,-68}` | W0 separation n compte unique | LOGICAL | - |
| `{0,-67}` | W0 Existe ecriture | LOGICAL | - |
| `{0,-66}` | W0 normal | LOGICAL | - |
| `{0,-65}` | W0 reprise | LOGICAL | - |
| `{0,-64}` | W0 chrono reprise | NUMERIC | - |
| `{0,-63}` | W0 toDo | LOGICAL | - |
| `{0,-62}` | W0 Log | LOGICAL | - |
| `{0,-61}` | W0 chrono histo | NUMERIC | - |
| `{0,-60}` | W0 code LOG existe | LOGICAL | - |
| `{0,-59}` | W0 chrono du LOG | NUMERIC | - |

### 4.2 Variables globales (VG)

| Ref | Decode | Role |
|-----|--------|------|
| `{32768,0}` | VG.LOGIN | - |
| `{32768,1}` | VG.USER | - |
| `{32768,2}` | VG.Retour Chariot | - |
| `{32768,3}` | VG.DROIT ACCES IT ? | - |
| `{32768,4}` | VG.DROIT ACCES CAISSE ? | - |
| `{32768,5}` | VG.BRAZIL DATACATCHING? | - |
| `{32768,6}` | VG.USE MDR | - |
| `{32768,7}` | VG.VRL ACTIF ? | - |
| `{32768,8}` | VG.ECI ACTIF ? | - |
| `{32768,9}` | VG.COMPTE CASH ACTIF ? | - |
| `{32768,10}` | VG.IND SEJ PAYE ACTIF ? | - |
| `{32768,11}` | VG.CODE LANGUE USER | - |
| `{32768,12}` | VG.EFFECTIF ACTIF ? | - |
| `{32768,13}` | VG.TAXE SEJOUR ACTIF ? | - |
| `{32768,14}` | VG.N° version | - |

> Total: 188 variables mappees

---

## 5. EXPRESSIONS (1458 total, 498 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,1}=''` | `P0 code GM=''` |
| 2 | `'C'` | `'C'` |
| 3 | `{0,1}` | `P0 code GM` |
| 4 | `{0,30}<>'F'` | `W0 chrono histo<>'F'` |
| 5 | `{0,15}<>'R'` | `W0 validation<>'R'` |
| 6 | `{0,16}` | `W0 n° compteur` |
| 7 | `NOT ({0,16})` | `NOT (W0 n° compteur)` |
| 8 | `'F'` | `'F'` |
| 9 | `{0,30}='F'` | `W0 chrono histo='F'` |
| 10 | `Date ()` | `Date ()` |
| 11 | `Time ()` | `Time ()` |
| 12 | `{0,2}` | `P0 filiation` |
| 13 | `{0,3}` | `P0 masque montant` |
| 14 | `SetCrsr (2)` | `SetCrsr (2)` |
| 15 | `SetCrsr (1)` | `SetCrsr (1)` |
| 16 | `{0,17}` | `W0 nbre filiation` |
| 17 | `NOT ({0,31})` | `NOT (W0 code LOG existe)` |
| 18 | `{0,31}` | `W0 code LOG existe` |
| 19 | `27` | `27` |
| 20 | `{0,32}` | `W0 chrono du LOG` |
| 21 | `NOT ({0,32})` | `NOT (W0 chrono du LOG)` |
| 22 | `'FALSE'LOG` | `'FALSE'LOG` |
| 23 | `'SEPAR'` | `'SEPAR'` |
| 24 | `'FALSE'LOG` | `'FALSE'LOG` |
| 25 | `0` | `0` |
| 26 | `'TRUE'LOG` | `'TRUE'LOG` |
| 27 | `NOT ({0,34})` | `NOT (W0.ListeNom_Prenom_Garantie)` |
| 28 | `{0,34}` | `W0.ListeNom_Prenom_Garantie` |
| 29 | `{0,41}=6 OR {0,10}` | `{0,41}=6 OR P0.Sans interface ecran` |
| 30 | `{0,36}` | `{0,36}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 60 (58 W / 2 R) |
| Parametres | 13 |
| Variables locales | 35 |
| Expressions | 1458 |
| Expressions 100% decodees | 498 (34%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

