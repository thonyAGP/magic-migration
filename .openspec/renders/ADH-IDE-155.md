# ADH IDE 155 - Controle fermeture caisse WS

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_155.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 155 |
| **Fichier XML** | Prg_155.xml |
| **Description** | Controle fermeture caisse WS |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 19 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_155.xml. L'ID XML (155) peut differer de la position IDE (155).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-155.yaml`
### 1.2 Flux Utilisateur
> A completer dans annotations YAML

### 1.3 Notes Migration
> A completer dans annotations YAML

### 1.4 Dependances ECF



### 1.5 Tags
> Aucun tag defini

---

## 2. TABLES (21 tables - 7 en ecriture)

| IDE# | Nom Physique | Nom Logique | Access | Usage |
|------|--------------|-------------|--------|-------|
| #232 | `caisse_devise` | gestion_devise_session | **W** | 7x |
| #241 | `caisse_pointage_apprem` | pointage_appro_remise | **W** | 18x |
| #242 | `caisse_pointage_article` | pointage_article | **W** | 18x |
| #243 | `caisse_pointage_devise` | pointage_devise | **W** | 22x |
| #246 | `caisse_session` | histo_sessions_caisse | **W** | 19x |
| #505 | `%club_user%_pv_cafil18_dat` | pv_comptable | **W** | 6x |
| #510 | `%club_user%_pv_disctmp_dat` | pv_discounts | **W** | 1x |
| #31 | `cafil009_dat` | gm-complet_______gmc | R | 4x |
| #40 | `cafil018_dat` | comptable________cte | R | 3x |
| #44 | `cafil022_dat` | change___________chg | R | 1x |
| #77 | `cafil055_dat` | articles_________art | R | 2x |
| #90 | `cafil068_dat` | devises__________dev | R | 4x |
| #147 | `cafil125_dat` | change_vente_____chg | R | 1x |
| #197 | `caisse_artstock` | articles_en_stock | R | 2x |
| #247 | `caisse_session_article` | histo_sessions_caisse_article | R | 2x |
| #248 | `caisse_session_coffre2` | sessions_coffre2 | R | 5x |
| #249 | `caisse_session_detail` | histo_sessions_caisse_detail | R | 25x |
| #250 | `caisse_session_devise` | histo_sessions_caisse_devise | R | 11x |
| #251 | `caisse_session_remise` | histo_sessions_caisse_remise | R | 1x |
| #263 | `caisse_vente` | vente | R | 1x |
| #697 | `droits` | droits_applications | R | 1x |

---

## 3. PARAMETRES D'ENTREE (19)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Param K/T | ALPHA | - |
| P2 | Param societe | ALPHA | - |
| P3 | Param devise locale | ALPHA | - |
| P4 | Param date comptable | DATE | - |
| P5 | Param masque montant | ALPHA | - |
| P6 | Param nombre decimale | NUMERIC | - |
| P7 | Param chrono session | NUMERIC | - |
| P8 | Param montant | NUMERIC | - |
| P9 | Param montant monnaie | NUMERIC | - |
| P10 | Param montant produits | NUMERIC | - |
| P11 | Param montant cartes | NUMERIC | - |
| P12 | Param montant cheques | NUMERIC | - |
| P13 | Param montant od | NUMERIC | - |
| P14 | Param nbre devise | NUMERIC | - |
| P15 | Param UNI/BI | ALPHA | - |
| P16 | p.i.Terminal coffre2 | NUMERIC | - |
| P17 | Date debut session | DATE | - |
| P18 | Time debut session | TIME | - |
| P19 | V parametre 2 caisses | ALPHA | - |
| P20 | v montant inter | NUMERIC | - |
| P21 | v montant monnaie inter | NUMERIC | - |
| P22 | v montant produit inter | NUMERIC | - |

---

## 4. VARIABLES PRINCIPALES

### 4.1 Variables de travail (W0/V0)

| Nom | Type | Role |
|-----|------|------|
| v.Caisse COFFRE 2 ? | LOGICAL | - |

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

> Total: 190 variables mappees

---

## 5. EXPRESSIONS (1313 total, 758 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{0,15}='B'` | `p.i.Terminal coffre2='B'` |
| 2 | `{0,22}='O' AND ({0,18} AND NOT {0,19} OR {0,43} AND {0,19})` | `v montant inter='O' AND (Param session ouverte VIL ? AND ...` |
| 3 | `{0,1}='K'` | `Param societe='K'` |
| 4 | `{0,1}='T'` | `Param societe='T'` |
| 5 | `{0,8}` | `Param montant monnaie` |
| 6 | `{0,9}` | `Param montant produits` |
| 7 | `{0,10}` | `Param montant cartes` |
| 8 | `{32768,1}` | `VG.USER` |
| 9 | `{0,7}` | `Param montant` |
| 10 | `'I'` | `'I'` |
| 11 | `'O'` | `'O'` |
| 12 | `IF({32768,78}, Val({0,41}, '3')={0,16}, {0,42}={0,17})` | `IF(VG.Hostname au lieu de Term, Val({0,41}, '3')=p.i.Host...` |
| 13 | `NOT {32768,78}` | `NOT VG.Hostname au lieu de Term` |
| 14 | `{32768,78}` | `VG.Hostname au lieu de Term` |
| 1 | `'CAISSE'` | `'CAISSE'` |
| 2 | `{0,2}` | `Param devise locale` |
| 1 | `0` | `0` |
| 1 | `{32768,1}` | `VG.USER` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `IF({1,32},{1,33},{1,7})` | `IF({1,32},{1,33},{1,7})` |
| 3 | `'L'` | `'L'` |
| 4 | `'I'` | `'I'` |
| 5 | `{1,8}+{0,7}` | `{1,8}+Param montant` |
| 6 | `{1,9}+{0,8}` | `{1,9}+Param montant monnaie` |
| 7 | `{1,10}+{0,9}` | `{1,10}+Param montant produits` |
| 8 | `{1,11}+{0,10}` | `{1,11}+Param montant cartes` |
| 9 | `{1,12}+{0,11}` | `{1,12}+Param montant cheques` |
| 10 | `{1,13}+{0,12}` | `{1,13}+Param montant od` |
| 11 | `{1,14}+{0,13}` | `{1,14}+Param nbre devise` |
| 12 | `{0,5}` | `Param nombre decimale` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 21 (7 W / 14 R) |
| Parametres | 19 |
| Variables locales | 36 |
| Expressions | 1313 |
| Expressions 100% decodees | 758 (58%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

