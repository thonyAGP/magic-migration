# ADH IDE 255 - VAD validés à imprimer

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-26
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_251.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 255 |
| **Fichier XML** | Prg_251.xml |
| **Description** | VAD validés à imprimer |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 1 |
| **Module** | ADH |
| **Dossier IDE** | Ventes |

> **Note**: Ce programme est Prg_251.xml. L'ID XML (251) peut differer de la position IDE (255).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-255.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (13 tables - 4 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #519 | `%club_user%_pv_rentals_dat` | pv_cust_rentals | **W** | 1x |
| #596 | `%club_user%tmp_ecrpolice_dat` | tempo_ecran_police | **W** | 2x |
| #847 | `%club_user%_stat_lieu_vente_date` | stat_lieu_vente_date | **W** | 1x |
| #945 | `Table_945` | Unknown | **W** | 3x |
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 1x |
| #34 | `cafil012_dat` | hebergement______heb | R | 2x |
| #40 | `cafil018_dat` | comptable________cte | R | 2x |
| #69 | `cafil047_dat` | initialisation___ini | R | 2x |
| #122 | `cafil100_dat` | unilateral_bilateral | R | 2x |
| #197 | `caisse_artstock` | articles_en_stock | R | 2x |
| #263 | `caisse_vente` | vente | R | 2x |
| #382 | `pv_discountlist_dat` | pv_discount_reasons | R | 1x |
| #804 | `valeur_credit_bar_defaut` | valeur_credit_bar_defaut | R | 2x |

---

## 3. PARAMETRES D'ENTREE (1)

| # | Nom | Type | Description |
|---|-----|------|-------------|

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.num ligne | NUMERIC | - |
| v.chambre | UNICODE | - |
| v.Nom | UNICODE | - |
| v.Compte | NUMERIC | - |
| v.Num Ticket VRL/VSL | NUMERIC | - |
| v.Mop | UNICODE | - |

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

> Total: 132 variables mappees

---

## 5. EXPRESSIONS (157 total, 30 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,1}` | `v.num ligne` |
| 2 | `{0,2}` | `v.chambre` |
| 3 | `'VAD'` | `'VAD'` |
| 4 | `{0,9}` | `{0,9}` |
| 5 | `Trim({0,45})` | `Trim({0,45})` |
| 6 | `Date()` | `Date()` |
| 7 | `{0,39}` | `{0,39}` |
| 8 | `IF({0,40}<>0,'N11.'&Trim(Str({0,40},'#'))&'CZ','N13CZ')` | `IF({0,40}<>0,'N11.'&Trim(Str({0,40},'#'))&'CZ','N13CZ')` |
| 9 | `{0,42}` | `{0,42}` |
| 10 | `{0,2}` | `v.chambre` |
| 11 | `'TRUE'LOG` | `'TRUE'LOG` |
| 12 | `DbDel('{596,4}'DSOURCE,'')` | `DbDel('{596,4}'DSOURCE,'')` |
| 13 | `{0,11}='VER'` | `{0,11}='VER'` |
| 14 | `{0,42}<>'B'` | `{0,42}<>'B'` |
| 15 | `3` | `3` |
| 16 | `4` | `4` |
| 17 | `'C'` | `'C'` |
| 18 | `Trim({0,1})=''` | `Trim(v.num ligne)=''` |
| 19 | `30` | `30` |
| 1 | `{1,1}` | `{1,1}` |
| 2 | `{1,2}` | `{1,2}` |
| 3 | `'VAD'` | `'VAD'` |
| 4 | `{0,3}` | `v.Nom` |
| 5 | `{0,7}` | `{0,7}` |
| 6 | `{0,8}` | `{0,8}` |
| 7 | `{0,9}` | `{0,9}` |
| 8 | `'H'` | `'H'` |
| 9 | `IF(IN ({0,30},'VSL','VRL'),{0,39}, {0,21})` | `IF(IN ({0,30},'VSL','VRL'),{0,39}, {0,21})` |
| 10 | `{0,17}` | `{0,17}` |
| 11 | `{0,18}` | `{0,18}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 13 (4 W / 9 R) |
| Parametres | 1 |
| Variables locales | 7 |
| Expressions | 157 |
| Expressions 100% decodees | 30 (19%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-26 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

