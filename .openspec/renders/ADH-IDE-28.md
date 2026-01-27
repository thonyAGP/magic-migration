# ADH IDE 28 - Fusion

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_28.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 28 |
| **Fichier XML** | Prg_28.xml |
| **Description** | Fusion |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 11 |
| **Module** | ADH |
| **Dossier IDE** | Changement Compte |

> **Note**: Ce programme est Prg_28.xml. L'ID XML (28) peut differer de la position IDE (28).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
- **Qui**: Operateur caisse / Receptionniste
- **Quoi**: Fusionner plusieurs comptes adherents en un seul
- **Pourquoi**: Permettre le regroupement de comptes (mariage, famille recomposee, facturation groupee)
### 1.2 Flux Utilisateur
1. Selection du compte cible (destinataire)
2. Selection du ou des comptes sources a fusionner
3. Affichage des membres et operations de chaque compte
4. Verification des soldes et depots
5. Confirmation de la fusion
6. Transfert des operations vers compte cible
7. Cloture des comptes sources

### 1.3 Notes Migration
- Programme ECF partage - appele depuis PBP et PVE
- Manipulation transactionnelle de plusieurs tables
- Transfert operations entre comptes
- 1526 expressions - logique complexe
- Gestion coherence referentielle post-fusion

### 1.4 Dependances ECF

PARTAGE via ADH.ecf (Sessions_Reprises) - Appele depuis PBP et PVE

### 1.5 Tags
`compte``, ``fusion``, ``ecf-shared``, ``cross-project``, ``critical`

---

## 2. TABLES (62 tables - 60 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #15 | `bartransacent` | transac_entete_bar | **W** | 3x |
| #19 | `bldetail` | bl_detail | **W** | 3x |
| #23 | `cafil001_dat` | reseau_cloture___rec | **W** | 5x |
| #29 | `cafil007_dat` | voyages__________voy | **W** | 3x |
| #30 | `cafil008_dat` | gm-recherche_____gmr | **W** | 8x |
| #31 | `cafil009_dat` | gm-complet_______gmc | **W** | 2x |
| #32 | `cafil010_dat` | prestations | **W** | 3x |
| #33 | `cafil011_dat` | prestations______pre | **W** | 3x |
| #34 | `cafil012_dat` | hebergement______heb | **W** | 3x |
| #35 | `cafil013_dat` | personnel_go______go | **W** | 2x |
| #36 | `cafil014_dat` | client_gm | **W** | 1x |
| #37 | `cafil015_dat` | commentaire_gm_________acc | **W** | 3x |
| #38 | `cafil016_dat` | comptable_gratuite | **W** | 3x |
| #39 | `cafil017_dat` | depot_garantie___dga | **W** | 6x |
| #40 | `cafil018_dat` | comptable________cte | **W** | 3x |
| #41 | `cafil019_dat` | depot_objets_____doa | **W** | 3x |
| #42 | `cafil020_dat` | depot_devises____dda | **W** | 3x |
| #43 | `cafil021_dat` | solde_devises____sda | **W** | 2x |
| #44 | `cafil022_dat` | change___________chg | **W** | 2x |
| #46 | `cafil024_dat` | mvt_prestation___mpr | **W** | 3x |
| #47 | `cafil025_dat` | compte_gm________cgm | **W** | 12x |
| #48 | `cafil026_dat` | lignes_de_solde__sld | **W** | 3x |
| #51 | `cafil029_dat` | fusion_eclatementfec | **W** | 4x |
| #79 | `cafil057_dat` | gratuites________gra | **W** | 3x |
| #80 | `cafil058_dat` | codes_autocom____aut | **W** | 2x |
| #93 | `cafil071_dat` | vendeurs_________ven | **W** | 1x |
| #123 | `cafil101_dat` | fichier_messagerie | **W** | 2x |
| #131 | `cafil109_dat` | fichier_validation | **W** | 3x |
| #137 | `cafil115_dat` | fichier_histotel | **W** | 3x |
| #147 | `cafil125_dat` | change_vente_____chg | **W** | 2x |
| #148 | `cafil126_dat` | lignes_de_solde__sld | **W** | 3x |
| #167 | `cafil145_dat` | troncon__________tro | **W** | 1x |
| #168 | `cafil146_dat` | heb_circuit______hci | **W** | 3x |
| #171 | `cafil149_dat` | commentaire______com | **W** | 1x |
| #263 | `caisse_vente` | vente | **W** | 2x |
| #266 | `cccompta` | cc_comptable | **W** | 4x |
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
| #343 | `histo_fus_sep_saisie` | histo_fusionseparation_saisie | **W** | 9x |
| #358 | `moddossier_dat` | import_mod | **W** | 3x |
| #366 | `pmsprintparam` | pms_print_param | **W** | 3x |
| #382 | `pv_discountlist_dat` | pv_discount_reasons | **W** | 1x |
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

## 3. PARAMETRES D'ENTREE (11)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | P0 societe | ALPHA | - |
| P2 | P0 code GM | NUMERIC | - |
| P3 | P0 filiation | NUMERIC | - |
| P4 | P0 masque montant | ALPHA | - |
| P5 | P0 solde | NUMERIC | - |
| P6 | P0 date limite solde | DATE | - |
| P7 | P0 nom village | ALPHA | - |
| P8 | P0 Bilateral | ALPHA | - |
| P9 | W0 imprimante | NUMERIC | - |
| P10 | W0 reseau | ALPHA | - |
| P11 | W0 validation | ALPHA | - |
| P12 | W0 filiation libre | NUMERIC | - |
| P13 | W0 type operation | ALPHA | - |
| P14 | W0 date operation | DATE | - |
| P15 | W0 heure operation | TIME | - |
| P16 | W0 qualite compte | ALPHA | - |
| P17 | W0 fin tache | ALPHA | - |
| P18 | W0 Existe ecriture | LOGICAL | - |
| P19 | W0 normal | LOGICAL | - |
| P20 | W0 reprise | LOGICAL | - |
| P21 | W0 chrono reprise | NUMERIC | - |
| P22 | W0 toDo | LOGICAL | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Ref | Nom | Type | Role |
|-----|-----|------|------|
| `{0,-82}` | W0 imprimante | NUMERIC | - |
| `{0,-81}` | W0 reseau | ALPHA | - |
| `{0,-80}` | W0 validation | ALPHA | - |
| `{0,-79}` | W0 filiation libre | NUMERIC | - |
| `{0,-78}` | W0 type operation | ALPHA | - |
| `{0,-77}` | W0 date operation | DATE | - |
| `{0,-76}` | W0 heure operation | TIME | - |
| `{0,-75}` | W0 qualite compte | ALPHA | - |
| `{0,-74}` | W0 fin tache | ALPHA | - |
| `{0,-73}` | W0 Existe ecriture | LOGICAL | - |
| `{0,-72}` | W0 normal | LOGICAL | - |
| `{0,-71}` | W0 reprise | LOGICAL | - |
| `{0,-70}` | W0 chrono reprise | NUMERIC | - |
| `{0,-69}` | W0 toDo | LOGICAL | - |
| `{0,-68}` | W0 Log | LOGICAL | - |
| `{0,-67}` | W0 chrono histo | NUMERIC | - |
| `{0,-66}` | W0 code LOG existe | LOGICAL | - |
| `{0,-65}` | W0 chrono du LOG | NUMERIC | - |
| `{0,-64}` | W0 reprise confirmee | NUMERIC | - |
| `{0,-59}` | W0 Compte garantie à conserver | NUMERIC | - |

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

> Total: 190 variables mappees

---

## 5. EXPRESSIONS (1526 total, 512 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,1}` | `P0 code GM` |
| 2 | `{0,13}<>'R'` | `W0 validation<>'R'` |
| 3 | `{0,14}='V'` | `W0 filiation libre='V'` |
| 4 | `{0,14}<>'V'` | `W0 filiation libre<>'V'` |
| 5 | `'F'` | `'F'` |
| 6 | `{0,27}='F'` | `W0 code LOG existe='F'` |
| 7 | `{0,27}<>'F'` | `W0 code LOG existe<>'F'` |
| 8 | `'F'` | `'F'` |
| 9 | `Date ()` | `Date ()` |
| 10 | `Time ()` | `Time ()` |
| 11 | `{0,2}` | `P0 filiation` |
| 12 | `{0,3}` | `P0 masque montant` |
| 13 | `28` | `28` |
| 14 | `{0,28}` | `W0 chrono du LOG` |
| 15 | `NOT ({0,28})` | `NOT (W0 chrono du LOG)` |
| 16 | `''` | `''` |
| 17 | `0` | `0` |
| 18 | `'MERGE'` | `'MERGE'` |
| 19 | `'FALSE'LOG` | `'FALSE'LOG` |
| 20 | `{0,30}` | `W0 Compte garantie à conserver` |
| 21 | `{0,32}` | `W0 Garantie Club à conserver?` |
| 22 | `0` | `0` |
| 23 | `'1F'` | `'1F'` |
| 24 | `'2T'` | `'2T'` |
| 25 | `'3E'` | `'3E'` |
| 26 | `10` | `10` |
| 27 | `20` | `20` |
| 28 | `30` | `30` |
| 29 | `40` | `40` |
| 30 | `50` | `50` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 62 (60 W / 2 R) |
| Parametres | 11 |
| Variables locales | 36 |
| Expressions | 1526 |
| Expressions 100% decodees | 512 (34%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

