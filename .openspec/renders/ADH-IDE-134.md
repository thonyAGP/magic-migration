# ADH IDE 134 - Mise à jour detail session WS

> **Version spec** : 2.1 (Enhanced)
> **Genere le** : 2026-01-27
> **Source** : `D:\Data\Migration\XPA\PMS\ADH\Source\Prg_134.xml`

---

## 1. IDENTIFICATION

| Attribut | Valeur |
|----------|--------|
| **Format IDE** | ADH IDE 134 |
| **Fichier XML** | Prg_134.xml |
| **Description** | Mise à jour detail session WS |
| **Type** | B (O=Online, B=Batch) |
| **Parametres** | 17 |
| **Module** | ADH |
| **Dossier IDE** | Gestion Caisse |

> **Note**: Ce programme est Prg_134.xml. L'ID XML (134) peut differer de la position IDE (134).


---

## PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)

### 1.1 Objectif Metier
> A completer dans `.openspec/annotations/ADH-IDE-134.yaml`
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
| #247 | `caisse_session_article` | histo_sessions_caisse_article | **W** | 2x |
| #249 | `caisse_session_detail` | histo_sessions_caisse_detail | **W** | 1x |
| #250 | `caisse_session_devise` | histo_sessions_caisse_devise | **W** | 4x |
| #251 | `caisse_session_remise` | histo_sessions_caisse_remise | **W** | 1x |
| #50 | `cafil028_dat` | moyens_reglement_mor | R | 1x |
| #139 | `cafil117_dat` | moyens_reglement_mor | R | 1x |
| #196 | `caisse_article` | gestion_article_session | R | 2x |
| #232 | `caisse_devise` | gestion_devise_session | R | 2x |
| #244 | `caisse_saisie_appro_dev` | saisie_approvisionnement | R | 2x |
| #505 | `%club_user%_pv_cafil18_dat` | pv_comptable | R | 1x |

---

## 3. PARAMETRES D'ENTREE (17)

| # | Nom | Type | Description |
|---|-----|------|-------------|
| P1 | Param societe | ALPHA | - |
| P2 | Param devise locale | ALPHA | - |
| P3 | Param UNI/BI | ALPHA | - |
| P4 | Param chrono session | NUMERIC | - |
| P5 | Param Quand | ALPHA | - |
| P6 | Param Quoi | ALPHA | - |
| P7 | Param Type | ALPHA | - |
| P8 | Param montant | NUMERIC | - |
| P9 | Param montant monnaie | NUMERIC | - |
| P10 | Param montant produits | NUMERIC | - |
| P11 | Param montant cartes | NUMERIC | - |
| P12 | Param montant cheques | NUMERIC | - |
| P13 | Param montant od | NUMERIC | - |
| P14 | Param Nbre devises | NUMERIC | - |
| P15 | Param commentaire ecart | ALPHA | - |
| P16 | Param commentaire ecart devise | ALPHA | - |

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

> Total: 152 variables mappees

---

## 5. EXPRESSIONS (144 total, 52 decodees)

| # | Expression brute | Decode |
|---|------------------|--------|
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `{0,4}` | `Param Quand` |
| 3 | `{0,20}+1` | `{0,20}+1` |
| 4 | `{0,7}` | `Param montant` |
| 5 | `{0,5}` | `Param Quoi` |
| 6 | `Date ()` | `Date ()` |
| 7 | `Time ()` | `Time ()` |
| 8 | `{0,8}` | `Param montant monnaie` |
| 9 | `{0,9}` | `Param montant produits` |
| 10 | `{0,10}` | `Param montant cartes` |
| 11 | `{0,11}` | `Param montant cheques` |
| 12 | `{0,12}` | `Param montant od` |
| 13 | `{0,13}` | `Param Nbre devises` |
| 14 | `{0,15}` | `Param commentaire ecart devise` |
| 15 | `{0,14}` | `Param commentaire ecart` |
| 16 | `{0,16}` | `Param ouverture auto` |
| 17 | `{0,7}='E'` | `Param montant='E'` |
| 18 | `{0,14}<>0` | `Param commentaire ecart<>0` |
| 19 | `{0,7}='V'` | `Param montant='V'` |
| 20 | `{0,7}='V' AND {0,10}<>0` | `Param montant='V' AND Param montant cartes<>0` |
| 21 | `{0,5}='O' AND {0,7}='I'` | `Param Quoi='O' AND Param montant='I'` |
| 22 | `'REC'` | `'REC'` |
| 23 | `Str ({32768,79},'3P0')` | `Str (VG.Numéro pseudo terminal,'3P0')` |
| 24 | `GetHostName ()` | `GetHostName ()` |
| 25 | `IF({0,17},'O','')` | `IF({0,17},'O','')` |
| 1 | `{32768,1}` | `VG.USER` |
| 2 | `{0,9}>0` | `Param montant produits>0` |
| 3 | `{1,5}` | `{1,5}` |
| 4 | `{1,6}` | `{1,6}` |
| 1 | `{2,21}` | `{2,21}` |

---

## 6. STATISTIQUES

| Metrique | Valeur |
|----------|--------|
| Tables | 10 (4 W / 6 R) |
| Parametres | 17 |
| Variables locales | 17 |
| Expressions | 144 |
| Expressions 100% decodees | 52 (36%) |

---

## 7. HISTORIQUE

| Date | Action | Auteur |
|------|--------|--------|
| 2026-01-27 | Creation specification v2.0 | Claude |

---

*Specification v2.0 - Generee automatiquement par Generate-ProgramSpecV2.ps1*

